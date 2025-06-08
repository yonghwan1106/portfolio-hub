import os
import json
import re
import requests
from pathlib import Path
from datetime import datetime
import time

class ProjectScanner:
    def __init__(self, base_path="C:/MYCLAUDE_PROJECT", github_username="yonghwan1106"):
        self.base_path = Path(base_path)
        self.github_username = github_username
        self.github_base_url = f"https://{github_username}.github.io/"
        self.projects_data = []
        
        # 공모전 키워드 패턴 정의
        self.contest_patterns = {
            "지자체": ["시청", "구청", "군청", "광역시", "도청"],
            "농업": ["농업", "농촌", "농어촌", "AgriFood"],
            "환경": ["환경", "에너지", "친환경", "Eco", "그린"],
            "청년": ["청년", "Youth", "창업"],
            "규제혁신": ["규제", "혁신", "Innovation"],
            "AI/디지털": ["AI", "디지털", "스마트", "GenAI"],
            "관광": ["관광", "Tourism", "여행"],
            "안전": ["안전", "Safety", "재해"]
        }
        
        # 수상 키워드 패턴
        self.award_keywords = ["수상", "당선", "선정", "우수상", "최우수상", "대상", "입상"]

    def scan_all_projects(self):
        """전체 프로젝트 스캔 실행"""
        print("[SCAN] 프로젝트 스캔을 시작합니다...")
        
        if not self.base_path.exists():
            print(f"[ERROR] 경로를 찾을 수 없습니다: {self.base_path}")
            return None
            
        # 폴더 목록 가져오기
        project_folders = [f for f in self.base_path.iterdir() 
                          if f.is_dir() and not f.name.startswith('.')]
        
        print(f"[INFO] 총 {len(project_folders)}개 프로젝트 폴더 발견")
        
        for i, folder in enumerate(project_folders, 1):
            print(f"\n[{i}/{len(project_folders)}] {folder.name} 분석 중...")
            project_info = self.analyze_project(folder)
            if project_info:
                self.projects_data.append(project_info)
            time.sleep(0.3)  # API 호출 제한 방지
        
        # 통계 출력
        self.print_statistics()
        
        # JSON 파일로 저장
        self.save_to_json()
        
        return self.projects_data

    def analyze_project(self, folder_path):
        """개별 프로젝트 분석"""
        project_name = folder_path.name
        project_info = {
            "id": project_name,
            "name": project_name,
            "folder_path": str(folder_path),
            "scan_date": datetime.now().isoformat(),
            "category": self.categorize_project(project_name),
            "status": "analyzed"
        }
        
        try:
            # 1. 문서 분석
            docs_info = self.analyze_documents(folder_path)
            project_info.update(docs_info)
            
            # 2. 웹사이트 분석
            website_info = self.analyze_website(folder_path, project_name)
            project_info.update(website_info)
            
            # 3. 품질 점수 계산
            project_info["quality_score"] = self.calculate_quality_score(project_info)
            
            # 4. 수상 여부 확인
            project_info["award_status"] = self.check_award_status(project_info)
            
            return project_info
            
        except Exception as e:
            print(f"[WARNING] {project_name} 분석 중 오류: {str(e)}")
            project_info["status"] = "error"
            project_info["error"] = str(e)
            return project_info

    def analyze_documents(self, folder_path):
        """프로젝트 문서 분석"""
        docs_info = {
            "has_readme": False,
            "has_proposal": False,
            "has_website_folder": False,
            "document_files": [],
            "title": "",
            "description": "",
            "contest_info": {}
        }
        
        # 파일 목록 수집
        all_files = []
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                all_files.append(Path(root) / file)
        
        # 문서 분석
        for file_path in all_files:
            file_lower = file_path.name.lower()
            
            # README 파일 확인
            if file_lower.startswith('readme'):
                docs_info["has_readme"] = True
                content = self.read_file_safe(file_path)
                if content:
                    docs_info.update(self.extract_readme_info(content))
            
            # 제안서 파일 확인
            elif any(keyword in file_lower for keyword in ['제안서', 'proposal', '계획서']):
                docs_info["has_proposal"] = True
                docs_info["document_files"].append(file_path.name)
            
            # 기타 문서 파일
            elif file_path.suffix.lower() in ['.md', '.txt', '.hwp', '.pdf', '.docx']:
                docs_info["document_files"].append(file_path.name)
        
        # 웹사이트 폴더 확인
        website_folders = ['website', 'web', 'html', 'src', 'public']
        for folder_name in website_folders:
            if (folder_path / folder_name).exists():
                docs_info["has_website_folder"] = True
                break
        
        # HTML 파일 직접 확인
        html_files = [f for f in all_files if f.suffix.lower() in ['.html', '.htm']]
        if html_files:
            docs_info["has_website_folder"] = True
            docs_info["html_files"] = [f.name for f in html_files]
        
        return docs_info

    def analyze_website(self, folder_path, project_name):
        """웹사이트 분석 및 GitHub Pages 확인"""
        website_info = {
            "github_url": "",
            "is_live": False,
            "response_code": None,
            "has_mobile_responsive": False,
            "estimated_quality": "unknown"
        }
        
        # GitHub Pages URL 생성
        github_url = f"{self.github_base_url}{project_name}/"
        website_info["github_url"] = github_url
        
        # 사이트 접근 테스트
        try:
            response = requests.get(github_url, timeout=5)
            website_info["response_code"] = response.status_code
            
            if response.status_code == 200:
                website_info["is_live"] = True
                print(f"  -> 라이브 사이트 확인: {github_url}")
                
                # 간단한 품질 체크
                content = response.text.lower()
                quality_indicators = {
                    "has_title": bool(re.search(r'<title[^>]*>(?!\s*$)', content)),
                    "has_css": 'css' in content or 'style' in content,
                    "has_js": 'script' in content or 'javascript' in content,
                    "has_responsive": 'viewport' in content or 'responsive' in content,
                    "content_length": len(content)
                }
                
                website_info.update(quality_indicators)
                website_info["estimated_quality"] = self.estimate_website_quality(quality_indicators)
            else:
                print(f"  -> 사이트 접근 실패 (코드: {response.status_code})")
            
        except requests.RequestException as e:
            website_info["connection_error"] = str(e)
            print(f"  -> 연결 오류: {str(e)[:50]}...")
        
        return website_info

    def categorize_project(self, project_name):
        """프로젝트 카테고리 분류"""
        name_lower = project_name.lower()
        
        for category, keywords in self.contest_patterns.items():
            if any(keyword.lower() in name_lower for keyword in keywords):
                return category
        
        return "기타"

    def calculate_quality_score(self, project_info):
        """프로젝트 품질 점수 계산 (100점 만점)"""
        score = 0
        
        # 문서 완성도 (40점)
        if project_info.get("has_readme"):
            score += 20
        if project_info.get("has_proposal"):
            score += 15
        if project_info.get("document_files"):
            score += 5
        
        # 웹사이트 존재 및 품질 (40점)
        if project_info.get("is_live"):
            score += 20
            
            quality = project_info.get("estimated_quality", "unknown")
            if quality == "high":
                score += 20
            elif quality == "medium":
                score += 15
            elif quality == "low":
                score += 10
        
        # 추가 요소 (20점)
        if project_info.get("has_website_folder"):
            score += 10
        if project_info.get("contest_info"):
            score += 5
        if project_info.get("award_status") == "awarded":
            score += 5
        
        return min(score, 100)

    def estimate_website_quality(self, indicators):
        """웹사이트 품질 추정"""
        quality_score = 0
        
        if indicators.get("has_title"): quality_score += 1
        if indicators.get("has_css"): quality_score += 1
        if indicators.get("has_js"): quality_score += 1
        if indicators.get("has_responsive"): quality_score += 1
        if indicators.get("content_length", 0) > 5000: quality_score += 1
        
        if quality_score >= 4:
            return "high"
        elif quality_score >= 2:
            return "medium"
        else:
            return "low"

    def check_award_status(self, project_info):
        """수상 여부 확인"""
        # 문서 내용에서 수상 키워드 검색
        text_to_check = f"{project_info.get('title', '')} {project_info.get('description', '')}"
        
        for keyword in self.award_keywords:
            if keyword in text_to_check:
                return "awarded"
        
        # 폴더명에서 확인
        folder_name = project_info.get("name", "").lower()
        for keyword in self.award_keywords:
            if keyword in folder_name:
                return "awarded"
        
        return "unknown"

    def extract_readme_info(self, content):
        """README 내용에서 정보 추출"""
        info = {}
        
        # 제목 추출
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if title_match:
            info["title"] = title_match.group(1).strip()
        
        # 설명 추출 (첫 번째 단락)
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('```'):
                info["description"] = line[:200] + "..." if len(line) > 200 else line
                break
        
        return info

    def read_file_safe(self, file_path):
        """안전한 파일 읽기"""
        try:
            # 다양한 인코딩 시도
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        return f.read()
                except UnicodeDecodeError:
                    continue
            
            return None
            
        except Exception:
            return None

    def print_statistics(self):
        """스캔 결과 통계 출력"""
        total = len(self.projects_data)
        live_sites = sum(1 for p in self.projects_data if p.get("is_live"))
        has_readme = sum(1 for p in self.projects_data if p.get("has_readme"))
        awarded = sum(1 for p in self.projects_data if p.get("award_status") == "awarded")
        
        categories = {}
        quality_scores = [p.get("quality_score", 0) for p in self.projects_data]
        
        for project in self.projects_data:
            cat = project.get("category", "기타")
            categories[cat] = categories.get(cat, 0) + 1
        
        print("\n" + "="*50)
        print("프로젝트 스캔 결과 통계")
        print("="*50)
        print(f"총 프로젝트 수: {total}개")
        print(f"라이브 사이트: {live_sites}개 ({live_sites/total*100:.1f}%)")
        print(f"README 보유: {has_readme}개 ({has_readme/total*100:.1f}%)")
        print(f"수상 프로젝트: {awarded}개 ({awarded/total*100:.1f}%)")
        if quality_scores:
            print(f"평균 품질 점수: {sum(quality_scores)/len(quality_scores):.1f}점")
        
        print("\n카테고리별 분포:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: {count}개")

    def save_to_json(self, filename="projects_scan_result.json"):
        """결과를 JSON 파일로 저장"""
        output_path = self.base_path / filename
        
        result = {
            "scan_info": {
                "scan_date": datetime.now().isoformat(),
                "total_projects": len(self.projects_data),
                "scanner_version": "1.0.0"
            },
            "projects": self.projects_data,
            "statistics": self.generate_statistics()
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"\n[SAVE] 결과 저장 완료: {output_path}")

    def generate_statistics(self):
        """통계 데이터 생성"""
        total = len(self.projects_data)
        if total == 0:
            return {}
        
        categories = {}
        for project in self.projects_data:
            cat = project.get("category", "기타")
            categories[cat] = categories.get(cat, 0) + 1
        
        return {
            "total_projects": total,
            "live_sites": sum(1 for p in self.projects_data if p.get("is_live")),
            "has_readme": sum(1 for p in self.projects_data if p.get("has_readme")),
            "awarded_projects": sum(1 for p in self.projects_data if p.get("award_status") == "awarded"),
            "categories": categories,
            "avg_quality_score": sum(p.get("quality_score", 0) for p in self.projects_data) / total
        }


def main():
    """메인 실행 함수"""
    scanner = ProjectScanner()
    
    print("MYCLAUDE_PROJECT 스캔 도구 v1.0")
    print("박용환님의 공모전 프로젝트 포트폴리오 분석을 시작합니다.\n")
    
    try:
        projects = scanner.scan_all_projects()
        
        if projects:
            print(f"\n[SUCCESS] 스캔 완료! {len(projects)}개 프로젝트 분석 결과를 확인하세요.")
            print("[INFO] 상세 결과는 'projects_scan_result.json' 파일에서 확인 가능합니다.")
        else:
            print("[ERROR] 스캔 실패!")
            
    except KeyboardInterrupt:
        print("\n[STOP] 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n[ERROR] 오류 발생: {str(e)}")


if __name__ == "__main__":
    main()

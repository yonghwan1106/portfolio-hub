import os
import json
from pathlib import Path

def diagnose_deployment_issues():
    """배포 실패 프로젝트들의 문제점 진단"""
    
    # 스캔 결과 로드
    with open("C:/MYCLAUDE_PROJECT/projects_scan_result.json", 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    failed_projects = [p for p in data['projects'] if not p.get('is_live')]
    
    print(f"배포 실패 프로젝트: {len(failed_projects)}개")
    print("="*50)
    
    diagnosis_results = []
    
    for project in failed_projects:
        project_path = Path(project['folder_path'])
        project_name = project['name']
        
        diagnosis = {
            'name': project_name,
            'path': str(project_path),
            'issues': [],
            'fixes': []
        }
        
        # 1. index.html 존재 여부 확인
        has_index = False
        html_files = []
        
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.lower().endswith(('.html', '.htm')):
                    html_files.append(file)
                    if file.lower() == 'index.html':
                        has_index = True
        
        if not has_index:
            diagnosis['issues'].append("index.html 파일 없음")
            if html_files:
                # 가장 적절한 파일을 index.html로 제안
                main_candidates = [f for f in html_files if any(keyword in f.lower() 
                                 for keyword in ['main', 'home', 'landing'])]
                if main_candidates:
                    diagnosis['fixes'].append(f"{main_candidates[0]}를 index.html로 복사")
                else:
                    diagnosis['fixes'].append(f"{html_files[0]}를 index.html로 복사")
            else:
                diagnosis['fixes'].append("HTML 파일 생성 필요")
        
        # 2. GitHub Pages 설정 확인
        if project_path.name not in ['gemini-api-test', 'gpt4o_image_analysis']:  # API 테스트 제외
            if not has_index and not html_files:
                diagnosis['issues'].append("웹사이트 파일 없음")
                diagnosis['fixes'].append("기본 웹사이트 생성 필요")
        
        # 3. 폴더 구조 확인
        has_website_folder = any((project_path / folder).exists() 
                               for folder in ['website', 'web', 'html', 'src'])
        
        if has_website_folder and not has_index:
            diagnosis['issues'].append("웹사이트 폴더는 있지만 루트에 index.html 없음")
            diagnosis['fixes'].append("웹사이트 폴더 내용을 루트로 이동")
        
        diagnosis_results.append(diagnosis)
        
        # 출력
        print(f"\n📂 {project_name}")
        print(f"   HTML 파일: {len(html_files)}개 {'✓' if has_index else '✗'}")
        for issue in diagnosis['issues']:
            print(f"   ❌ {issue}")
        for fix in diagnosis['fixes']:
            print(f"   🔧 {fix}")
    
    return diagnosis_results

def generate_fix_commands(diagnosis_results):
    """자동 수정 명령어 생성"""
    
    print("\n" + "="*50)
    print("🔧 자동 수정 명령어")
    print("="*50)
    
    for diagnosis in diagnosis_results:
        project_name = diagnosis['name']
        project_path = diagnosis['path']
        
        print(f"\n# {project_name} 수정")
        
        # HTML 파일이 있지만 index.html이 없는 경우
        if "index.html 파일 없음" in diagnosis['issues']:
            project_folder = Path(project_path)
            html_files = []
            
            for root, dirs, files in os.walk(project_folder):
                for file in files:
                    if file.lower().endswith(('.html', '.htm')):
                        html_files.append(os.path.join(root, file))
            
            if html_files:
                # 가장 적절한 파일 선택
                main_file = html_files[0]
                for file in html_files:
                    if any(keyword in os.path.basename(file).lower() 
                          for keyword in ['main', 'home', 'landing', 'index']):
                        main_file = file
                        break
                
                print(f'copy "{main_file}" "{project_path}\\index.html"')
        
        # 웹사이트 폴더 내용 이동
        if "웹사이트 폴더 내용을 루트로 이동" in diagnosis['fixes']:
            for folder in ['website', 'web', 'html', 'src']:
                folder_path = Path(project_path) / folder
                if folder_path.exists():
                    print(f'xcopy "{folder_path}\\*.*" "{project_path}\\" /E /Y')
                    break

if __name__ == "__main__":
    print("🔍 배포 문제 진단을 시작합니다...\n")
    diagnosis_results = diagnose_deployment_issues()
    generate_fix_commands(diagnosis_results)
    
    print("\n" + "="*50)
    print("💡 추천 조치사항")
    print("="*50)
    print("1. 위의 copy 명령어들을 실행하여 index.html 생성")
    print("2. GitHub에 커밋/푸시 후 GitHub Pages 재배포 확인") 
    print("3. 웹사이트가 없는 프로젝트는 기본 템플릿 생성")
    print("4. 수정 후 project_scanner_fixed.py 재실행으로 결과 확인")

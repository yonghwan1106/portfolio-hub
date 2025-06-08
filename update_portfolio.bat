@echo off
chcp 65001 > nul
echo ========================================
echo   포트폴리오 허브 자동 업데이트
echo ========================================

REM 현재 디렉토리 확인 (portfolio-hub 폴더에서 실행)
echo 현재 위치: %cd%
echo.

REM 1. 프로젝트 스캔 실행
echo [1/4] 전체 프로젝트 스캔 중...
python scripts\project_scanner_fixed.py
if errorlevel 1 (
    echo 스캔 실패! 스크립트를 종료합니다.
    pause
    exit /b 1
)

REM 2. 스캔 결과를 React 데이터 폴더에 복사
echo [2/4] 스캔 결과를 React 데이터로 복사 중...
if exist "projects_scan_result.json" (
    copy "projects_scan_result.json" "src\data\projects_scan_result.json"
    echo ✅ 스캔 결과 복사 완료
) else (
    echo ❌ 스캔 결과 파일을 찾을 수 없습니다!
    pause
    exit /b 1
)

REM 3. Git에 변경사항 추가
echo [3/4] Git 변경사항 추가 중...
git add .
git status

REM 4. 커밋 및 푸시
echo [4/4] GitHub에 배포 중...
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set current_date=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set current_time=%%a:%%b
git commit -m "Auto-update: %current_date% %current_time%"
git push origin main

echo.
echo ========================================
echo   ✅ 포트폴리오 업데이트 완료!
echo   🌐 웹사이트: https://yonghwan1106.github.io/portfolio-hub/
echo   ⏰ 2-3분 후 반영됩니다
echo ========================================

REM 최종 통계 출력
echo.
echo 📊 최신 통계:
python -c "import json; data=json.load(open('projects_scan_result.json')); live_count=sum(1 for p in data['projects'] if p.get('is_live', False)); print(f'총 프로젝트: {len(data[\"projects\"])}개'); print(f'라이브 사이트: {live_count}개 ({live_count/len(data[\"projects\"])*100:.1f}%%)')"

echo.
pause
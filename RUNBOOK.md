# b1-1 제출 Runbook

아래 순서만 수행하면 개인화, 최종 확인, 스크린샷, GitHub Pages 배포가 끝난다.

## 1. 내 정보로 바꾸기

`index.html`에서 다음 문자열을 검색해 교체한다.

| 현재 값 | 바꿀 값 |
|---|---|
| `Codyssey Learner` | 본인 이름 또는 활동명 |
| `octocat` | 본인 GitHub 아이디 |
| `hello@example.com` | 본인 이메일 |
| About 소개 문장 | 본인 소개 |

프로필 이미지를 바꾸려면 새 이미지를 `images/`에 넣고 `index.html`의 `src`, `alt`, `width`, `height`를 함께 수정한다.

## 2. 로컬 실행

```bash
cd /Users/eyshin/codyssey/b1-1
python3 -m http.server 5500
```

Chrome에서 <http://localhost:5500>을 연다. 종료할 때는 서버를 실행한 터미널에서 `Ctrl+C`를 누른다.

## 3. 5분 검수

- [ ] 네비게이션 링크가 각 섹션으로 부드럽게 이동한다.
- [ ] 화면 너비 390px에서 햄버거 메뉴가 열리고 닫힌다.
- [ ] 다크 모드 전환 후 새로고침해도 유지된다.
- [ ] 아래로 스크롤하면 헤더 배경과 맨 위로 버튼이 나타난다.
- [ ] GitHub 저장소 카드가 표시된다.
- [ ] 빈 폼 제출 시 필드별 오류가 나타난다.
- [ ] 올바른 이름·이메일·메시지 제출 시 성공 문구가 나타난다.

코드 문법도 한 번 확인한다.

```bash
node --check js/main.js
```

## 4. 제출 스크린샷

Chrome 개발자 도구의 기기 도구 모음을 사용한다.

1. 데스크톱: 1440 x 900, 라이트 모드 → `docs/screenshots/01-desktop.png`
2. 모바일: 390 x 844, 햄버거 메뉴를 연 상태 → `docs/screenshots/02-mobile.png`
3. 다크 모드: 1440 x 900, 다크 모드 전환 후 새로고침 → `docs/screenshots/03-dark-mode.png`

## 5. GitHub Pages 배포

GitHub에서 이름이 `b1-1`인 빈 저장소를 먼저 만든다. 그다음 프로젝트 터미널에서 실행한다.

```bash
git add .
git commit -m "feat: complete responsive portfolio"
git remote add origin https://github.com/<내-GitHub-아이디>/b1-1.git
git push -u origin main
```

GitHub 저장소에서 다음 순서로 설정한다.

1. **Settings → Pages**로 이동한다.
2. **Build and deployment**에서 `Deploy from a branch`를 선택한다.
3. 브랜치는 `main`, 폴더는 `/(root)`를 선택하고 저장한다.
4. 1~3분 뒤 `https://<내-GitHub-아이디>.github.io/b1-1/`에 접속한다.
5. 배포 주소에서도 위 5분 검수를 반복한다.

## 6. README 마무리

`README.md`의 다음 두 줄에 실제 주소를 적는다.

- GitHub 저장소 URL
- GitHub Pages URL

마지막으로 모바일·다크 모드 스크린샷도 README의 실행 결과 섹션에 이미지 문법으로 추가한다.

```markdown
![모바일 실행 화면](docs/screenshots/02-mobile.png)
![다크 모드 실행 화면](docs/screenshots/03-dark-mode.png)
```

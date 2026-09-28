const SCROLL_TOP_THRESHOLD = 300;
const HEADER_SCROLL_THRESHOLD = 60;
const REVEAL_THRESHOLD = 0.2;
const GITHUB_USERNAME = document.body.dataset.githubUser;

const elements = {
  body: document.body,
  header: document.querySelector('#site-header'),
  themeToggle: document.querySelector('#theme-toggle'),
  themeIcon: document.querySelector('.theme-icon'),
  menuToggle: document.querySelector('#menu-toggle'),
  navMenu: document.querySelector('#nav-menu'),
  navLinks: document.querySelectorAll('.nav-menu a, .logo, .hero-buttons a, .about-copy a'),
  scrollTop: document.querySelector('#scroll-top'),
  projectState: document.querySelector('#project-state'),
  githubLinks: document.querySelectorAll('#github-profile-link, #footer-github-link'),
  contactForm: document.querySelector('#contact-form'),
  formStatus: document.querySelector('#form-status'),
  currentYear: document.querySelector('#current-year'),
  revealItems: document.querySelectorAll('.reveal'),
};

const savedTheme = localStorage.getItem('portfolio-theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const state = {
  theme: savedTheme || systemTheme,
  menuOpen: false,
  projects: {
    status: 'loading',
    data: [],
    error: '',
  },
  form: {
    values: { name: '', email: '', message: '' },
    errors: { name: '', email: '', message: '' },
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const renderTheme = () => {
  const isDark = state.theme === 'dark';
  document.documentElement.dataset.theme = state.theme;
  elements.themeToggle.setAttribute('aria-pressed', String(isDark));
  elements.themeToggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
  elements.themeIcon.textContent = isDark ? '☀' : '☾';
};

const setTheme = (theme) => {
  state.theme = theme;
  localStorage.setItem('portfolio-theme', theme);
  renderTheme();
};

const renderMenu = () => {
  elements.navMenu.classList.toggle('active', state.menuOpen);
  elements.menuToggle.classList.toggle('active', state.menuOpen);
  if (state.menuOpen) {
    elements.body.classList.add('menu-open');
  } else {
    elements.body.classList.remove('menu-open');
  }
  elements.menuToggle.setAttribute('aria-expanded', String(state.menuOpen));
  elements.menuToggle.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
};

const setMenuOpen = (isOpen) => {
  state.menuOpen = isOpen;
  renderMenu();
};

const setProjectState = (status, data = [], error = '') => {
  state.projects = { status, data, error };
  renderProjects();
};

const renderProjects = () => {
  const { status, data, error } = state.projects;

  if (status === 'loading') {
    elements.projectState.innerHTML = `
      <div class="loading-state">
        <span class="spinner" aria-hidden="true"></span>
        <p>프로젝트를 불러오는 중...</p>
      </div>`;
    return;
  }

  if (status === 'error') {
    elements.projectState.innerHTML = `
      <div class="error-state">
        <strong>프로젝트를 불러올 수 없습니다.</strong>
        <p>${escapeHtml(error)}</p>
        <button class="button button-secondary retry-button" type="button">다시 시도</button>
      </div>`;
    return;
  }

  if (data.length === 0) {
    elements.projectState.innerHTML = `
      <div class="empty-state">
        <strong>표시할 프로젝트가 없습니다.</strong>
        <p>공개 저장소가 등록되면 이곳에 자동으로 표시됩니다.</p>
      </div>`;
    return;
  }

  const projectCards = data.map(({ name, description, html_url: url, language, stargazers_count: stars }) => `
    <article class="project-card">
      <h3>
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(name)} <span aria-hidden="true">↗</span>
        </a>
      </h3>
      <p class="project-description">${escapeHtml(description || '프로젝트 설명이 아직 없습니다.')}</p>
      <ul class="project-meta" aria-label="프로젝트 정보">
        <li>${escapeHtml(language || '기타')}</li>
        <li aria-label="스타 ${stars}개">★ ${stars}</li>
      </ul>
    </article>`);

  elements.projectState.innerHTML = `<div class="projects-grid">${projectCards.join('')}</div>`;
};

const fetchProjects = async () => {
  setProjectState('loading');

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=100`,
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
      }
      throw new Error(`GitHub API가 ${response.status} 상태로 응답했습니다.`);
    }

    const repositories = await response.json();
    const recentProjects = repositories
      .filter(({ fork }) => !fork)
      .sort(({ updated_at: firstDate }, { updated_at: secondDate }) =>
        secondDate.localeCompare(firstDate),
      )
      .slice(0, 6);

    const [firstProject] = recentProjects;
    if (firstProject) {
      document.title = `${GITHUB_USERNAME} | ${firstProject.name} 외 프로젝트`;
    }

    setProjectState('success', recentProjects);
  } catch (error) {
    setProjectState('error', [], error.message || '네트워크 연결을 확인해 주세요.');
  }
};

const validateField = (name, value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return `${name === 'name' ? '이름' : name === 'email' ? '이메일' : '메시지'}을(를) 입력해 주세요.`;
  }

  if (name === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmedValue) ? '' : '올바른 이메일 형식을 입력해 주세요.';
  }

  return '';
};

const renderFieldError = (name) => {
  const field = elements.contactForm.elements[name];
  const errorElement = document.querySelector(`#${name}-error`);
  const error = state.form.errors[name];
  field.setAttribute('aria-invalid', String(Boolean(error)));
  errorElement.textContent = error;
};

const updateFormField = (name, value) => {
  state.form.values[name] = value;
  state.form.errors[name] = validateField(name, value);
  renderFieldError(name);
};

elements.themeToggle.addEventListener('click', () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
});

elements.menuToggle.addEventListener('click', () => {
  setMenuOpen(!state.menuOpen);
});

elements.navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = targetId?.startsWith('#') ? document.querySelector(targetId) : null;

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setMenuOpen(false);
  });
});

window.addEventListener(
  'scroll',
  () => {
    elements.header.classList.toggle('scrolled', window.scrollY >= HEADER_SCROLL_THRESHOLD);
    elements.scrollTop.classList.toggle('visible', window.scrollY >= SCROLL_TOP_THRESHOLD);
  },
  { passive: true },
);

elements.scrollTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

elements.projectState.addEventListener('click', (event) => {
  if (event.target.closest('.retry-button')) {
    fetchProjects();
  }
});

['name', 'email', 'message'].forEach((fieldName) => {
  elements.contactForm.elements[fieldName].addEventListener('input', (event) => {
    updateFormField(fieldName, event.target.value);
    elements.formStatus.textContent = '';
  });
});

elements.contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  Object.entries(state.form.values).forEach(([name, value]) => {
    state.form.errors[name] = validateField(name, value);
    renderFieldError(name);
  });

  const hasErrors = Object.values(state.form.errors).some(Boolean);
  if (hasErrors) {
    elements.formStatus.textContent = '입력한 내용을 다시 확인해 주세요.';
    elements.contactForm.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  elements.formStatus.textContent = `${state.form.values.name.trim()}님, 메시지가 정상적으로 확인되었습니다.`;
  elements.contactForm.reset();
  state.form.values = { name: '', email: '', message: '' };
  state.form.errors = { name: '', email: '', message: '' };
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: REVEAL_THRESHOLD },
);

elements.revealItems.forEach((item) => revealObserver.observe(item));
elements.githubLinks.forEach((link) => {
  link.href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
});

elements.currentYear.textContent = new Date().getFullYear();
renderTheme();
renderMenu();
fetchProjects();

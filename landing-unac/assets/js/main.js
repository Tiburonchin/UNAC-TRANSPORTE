// ============================================================
// CONSTANTES GLOBALES
// ============================================================

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DOM = {
    navToggle: () => document.querySelector('[data-nav-toggle]'),
    nav: () => document.querySelector('[data-nav]'),
    skipLink: () => document.querySelector('.skip-link'),
    announcer: () => document.getElementById('announcements'),
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');
    initThemeToggle();
    initNavigation();
    initRevealAnimations();
    initInteractiveElements();
    initFocusManagement();
    initAriaUpdates();
    initScheduleSwitches();
    initFaqs();
    initRegistrationForm();
    initAccessibilityAnnouncements();
});

/**
 * Consolida interacciones de cards, buttons y ripple effects
 */
function initInteractiveElements() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        const card = e.target.closest('.feature-card, .cta-card, .news-card, .card');
        
        if (PREFERS_REDUCED_MOTION) return;
        
        if (btn) createRipple(e, btn, 'btn-ripple');
        if (card) createRipple(e, card, 'ripple');
        
        if (btn && !btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
}

/**
 * Inicializa navegación principal
 * - Maneja toggle del menú móvil (click, Escape)
 * - Actualiza aria-current en link activo según página
 * - Anuncia estado del menú a screen readers
 */
function initNavigation() {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    const page = document.body.dataset.page;
    const canAnimateNav = !PREFERS_REDUCED_MOTION && typeof nav?.animate === 'function';
    let navAnimation = null;

    if (navToggle && nav) {
        // Asegurar que nav tiene role="navigation"
        if (!nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegación principal');
        }

        const announceMenuState = (isOpen) => {
            const announcer = document.getElementById('announcements');
            if (announcer) {
                announcer.textContent = isOpen ? 'Menú abierto' : 'Menú cerrado';
            }
        };

        const getNavOrigin = () => {
            const toggleRect = navToggle.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            return {
                x: toggleRect.left + (toggleRect.width / 2) - navRect.left,
                y: Math.max(0, toggleRect.top + (toggleRect.height / 2) - navRect.top)
            };
        };

        const openMenu = () => {
            nav.classList.add('is-open');
            navToggle.setAttribute('aria-expanded', 'true');

            if (!canAnimateNav) {
                announceMenuState(true);
                return;
            }

            if (navAnimation) {
                navAnimation.cancel();
            }

            const origin = getNavOrigin();
            nav.style.transformOrigin = `${origin.x}px ${origin.y}px`;
            navAnimation = nav.animate([
                {
                    opacity: 0,
                    transform: 'translateY(-12px) scale(0.96)',
                    clipPath: `circle(8% at ${origin.x}px ${origin.y}px)`
                },
                {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                    clipPath: `circle(160% at ${origin.x}px ${origin.y}px)`
                }
            ], {
                duration: 340,
                easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                fill: 'both'
            });

            navAnimation.onfinish = () => {
                navAnimation = null;
                nav.style.removeProperty('transform-origin');
                nav.style.removeProperty('clip-path');
            };

            navAnimation.oncancel = () => {
                nav.style.removeProperty('transform-origin');
                nav.style.removeProperty('clip-path');
            };

            announceMenuState(true);
        };

        const closeMenu = (focusToggle = false) => {
            if (!nav.classList.contains('is-open')) {
                return;
            }

            if (!canAnimateNav) {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                if (focusToggle) {
                    navToggle.focus();
                }
                announceMenuState(false);
                return;
            }

            if (navAnimation) {
                navAnimation.cancel();
            }

            const origin = getNavOrigin();
            nav.style.transformOrigin = `${origin.x}px ${origin.y}px`;
            navAnimation = nav.animate([
                {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                    clipPath: `circle(160% at ${origin.x}px ${origin.y}px)`
                },
                {
                    opacity: 0,
                    transform: 'translateY(-10px) scale(0.97)',
                    clipPath: `circle(8% at ${origin.x}px ${origin.y}px)`
                }
            ], {
                duration: 260,
                easing: 'cubic-bezier(0.4, 0, 1, 1)',
                fill: 'both'
            });

            navAnimation.onfinish = () => {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                if (focusToggle) {
                    navToggle.focus();
                }
                announceMenuState(false);
                navAnimation = null;
                nav.style.removeProperty('transform-origin');
                nav.style.removeProperty('clip-path');
            };

            navAnimation.oncancel = () => {
                nav.style.removeProperty('transform-origin');
                nav.style.removeProperty('clip-path');
            };
        };

        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('is-open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) {
                closeMenu(true);
            }
        });

        nav.addEventListener('click', event => {
            if (event.target.matches('a')) {
                closeMenu();
            }
        });

        // Evita estados inconsistentes al pasar a desktop.
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 980 && nav.classList.contains('is-open')) {
                if (navAnimation) {
                    navAnimation.cancel();
                    navAnimation = null;
                }
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                nav.style.removeProperty('transform-origin');
                nav.style.removeProperty('clip-path');
            }
        });
    }

    if (page) {
        document.querySelectorAll('[data-nav-link]').forEach(link => {
            if (link.dataset.navLink === page) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
}

/**
 * Inicializa animaciones suaves de reveal con Intersection Observer
 * Aplica stagger animation respetando prefers-reduced-motion
 */
function initRevealAnimations() {
    const items = document.querySelectorAll('.reveal');

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                if (!PREFERS_REDUCED_MOTION) {
                    entry.target.style.setProperty('--reveal-delay', `${index * 75}ms`);
                }
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
}

/**
 * Utilidad para crear ripple effect
 * @param {Event} e - Evento de click
 * @param {Element} element - Elemento donde crear el ripple
 * @param {String} className - Clase del ripple (ripple o btn-ripple)
 */
function createRipple(e, element, className) {
    const ripple = document.createElement('span');
    ripple.classList.add(className);
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Gestiona focus y navegación por teclado
 * - Detecta navegación por Tab para mostrar focus indicators
 * - Implementa skip link funcional
 * - Resetea indicadores al usar ratón
 */
function initFocusManagement() {
    // Consolidar keyboard navigation en un solo listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        } else if (e.key === 'Escape') {
            const nav = document.querySelector('[data-nav]');
            if (nav?.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                const toggle = document.querySelector('[data-nav-toggle]');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            }
            document.body.classList.remove('keyboard-nav');
        }
    });

    document.addEventListener('click', () => {
        document.body.classList.remove('keyboard-nav');
    });

    // Enfocar el contenido principal al presionar skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('[id="content"]');
            if (mainContent) {
                mainContent.tabIndex = -1;
                mainContent.focus();
                mainContent.addEventListener('blur', () => mainContent.removeAttribute('tabindex'));
            }
        });
    }
}

/**
 * Actualiza ARIA labels dinámicamente
 * - Vincula secciones a sus headings (aria-labelledby)
 * - Marca SVG como decorativos (aria-hidden)
 */
function initAriaUpdates() {
    // Actualizar ARIA labels dinámicamente
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (!section.getAttribute('aria-labelledby')) {
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                const id = heading.id || `section-heading-${index}`;
                heading.id = id;
                section.setAttribute('aria-labelledby', id);
            }
        }
    });

    // Asegurar que los iconos SVG tengan aria-hidden
    document.querySelectorAll('.feature-icon svg, .contact-icon svg').forEach(svg => {
        if (!svg.getAttribute('aria-hidden')) {
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
        }
    });
}

function initAccessibilityAnnouncements() {
    // Crear región viva para anuncios dinámicos
    if (!document.querySelector('[role="status"]')) {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('class', 'sr-only');
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
    }
}

function initScheduleSwitches() {
    const switchButtons = document.querySelectorAll('[data-schedule-target]');
    const panels = document.querySelectorAll('[data-schedule-panel]');

    if (!switchButtons.length || !panels.length) {
        return;
    }

    const activate = target => {
        switchButtons.forEach(button => {
            button.classList.toggle('is-active', button.dataset.scheduleTarget === target);
        });

        panels.forEach(panel => {
            panel.classList.toggle('is-active', panel.dataset.schedulePanel === target);
        });
    };

    switchButtons.forEach(button => {
        button.addEventListener('click', () => activate(button.dataset.scheduleTarget));
    });

    activate(switchButtons[0].dataset.scheduleTarget);
}

function initFaqs() {
    const faqButtons = document.querySelectorAll('[data-faq-button]');

    if (!faqButtons.length) {
        return;
    }

    faqButtons.forEach((button, index) => {
        const id = button.id || `faq-button-${index}`;
        button.id = id;

        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            if (!item) {
                return;
            }

            const willOpen = !item.classList.contains('is-open');
            const answerId = `faq-answer-${index}`;
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.id = answerId;
                button.setAttribute('aria-expanded', willOpen);
                button.setAttribute('aria-controls', answerId);
            }

            document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('is-open'));
            if (willOpen) {
                item.classList.add('is-open');
            }
        });
    });
}

function initRegistrationForm() {
    const form = document.querySelector('[data-register-form]');
    const message = document.querySelector('[data-register-message]');

    if (!form || !message) {
        return;
    }

    const fields = {
        nombre: form.querySelector('#nombre'),
        dni: form.querySelector('#dni'),
        facultad: form.querySelector('#facultad'),
        horario: form.querySelector('#horario')
    };

    form.addEventListener('submit', event => {
        event.preventDefault();

        const values = {
            nombre: fields.nombre.value.trim(),
            dni: fields.dni.value.trim(),
            facultad: fields.facultad.value,
            horario: fields.horario.value
        };

        const invalid = !values.nombre || values.dni.length < 8 || !values.facultad || !values.horario;
        if (invalid) {
            showMessage(message, 'Completa todos los campos con datos válidos para generar la preinscripción.', 'info');
            return;
        }

        const seat = Math.min(40, 5 + values.dni.replace(/\D/g, '').length * 3);
        showMessage(
            message,
            `Preinscripción lista para ${values.nombre}. Se asignó una referencia temporal y un asiento estimado ${seat.toString().padStart(2, '0')}.`,
            'success'
        );
        form.reset();
    });
}

function showMessage(element, text, type) {
    element.className = `message is-visible ${type}`;
    element.textContent = text;
}

/**
 * Gestiona tema oscuro/claro
 * - Detecta preferencia del sistema (prefers-color-scheme)
 * - Persiste en localStorage
 * - Iconos se manejan vía CSS (no JavaScript)
 */
function initThemeToggle() {
    const html = document.documentElement;
    const toggle = document.querySelector('[data-theme-toggle]');
    
    if (!toggle) return;

    const getPreferredTheme = () => {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = (theme) => {
        const isDark = theme === 'dark';
        html.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    const currentTheme = getPreferredTheme();
    setTheme(currentTheme);

    toggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

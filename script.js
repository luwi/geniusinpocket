// Genius In Pocket - Interactive JavaScript
// Author: Lubos Winkler
// Description: Handles countdown timer, particle effects, and user interactions

class GeniusInPocket {
    constructor() {
        this.launchDate = new Date('2024-12-31T23:59:59').getTime();
        this.particles = [];
        this.maxParticles = 50;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupCountdown();
        this.setupParticles();
        this.setupEmailForm();
        this.setupScrollEffects();
        this.setupInteractiveElements();
        
        // Start animations
        this.startCountdown();
        this.startParticleAnimation();
        
        console.log('🚀 Genius In Pocket initialized successfully!');
    }
    
    // Countdown Timer
    setupCountdown() {
        this.countdownElements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
    }
    
    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }
    
    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.launchDate - now;
        
        if (distance < 0) {
            this.handleCountdownComplete();
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        this.animateCounterUpdate(this.countdownElements.days, days.toString().padStart(2, '0'));
        this.animateCounterUpdate(this.countdownElements.hours, hours.toString().padStart(2, '0'));
        this.animateCounterUpdate(this.countdownElements.minutes, minutes.toString().padStart(2, '0'));
        this.animateCounterUpdate(this.countdownElements.seconds, seconds.toString().padStart(2, '0'));
    }
    
    animateCounterUpdate(element, newValue) {
        if (element.textContent !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.color = '#00f2fe';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
        }
    }
    
    handleCountdownComplete() {
        document.querySelector('.countdown-container').innerHTML = `
            <div class="launch-message">
                <h3>⏰ Countdown Complete</h3>
                <p>Stay tuned for updates!</p>
            </div>
        `;
    }
    
    // Particle System
    setupParticles() {
        this.particlesContainer = document.getElementById('particles-container');
        this.createInitialParticles();
    }
    
    createInitialParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        // Random colors for particles
        const colors = [
            'rgba(102, 126, 234, 0.6)',
            'rgba(118, 75, 162, 0.6)',
            'rgba(0, 242, 254, 0.6)',
            'rgba(255, 255, 255, 0.3)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                const index = this.particles.indexOf(particle);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
            }
        }, (duration + delay) * 1000);
    }
    
    startParticleAnimation() {
        setInterval(() => {
            if (this.particles.length < this.maxParticles) {
                this.createParticle();
            }
        }, 300);
    }
    
    // Email Form
    setupEmailForm() {
        const form = document.getElementById('signupForm');
        const emailInput = document.getElementById('emailInput');
        const submitBtn = form.querySelector('.submit-btn');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailSubmit(emailInput.value, submitBtn);
        });
        
        // Real-time email validation
        emailInput.addEventListener('input', (e) => {
            this.validateEmail(e.target.value, submitBtn);
        });
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async handleEmailSubmit(email, button) {
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading">Subscribing...</span>';
        button.disabled = true;

        try {
            // Get honeypot value for spam protection
            const honeypot = document.getElementById('website').value;

            // Send to backend
            const response = await fetch('./submit-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    website: honeypot // honeypot field
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('🎉 Success! You\'ll be the first to know when we launch.', 'success');
                document.getElementById('emailInput').value = '';

                // Add celebration effect
                this.triggerCelebration();
            } else {
                throw new Error(result.message || 'Subscription failed');
            }

        } catch (error) {
            console.error('Subscription error:', error);
            let errorMessage = 'Oops! Something went wrong. Please try again.';

            if (error.message.includes('Too many requests')) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('Disposable email')) {
                errorMessage = 'Please use a permanent email address.';
            }

            this.showMessage(errorMessage, 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
    

    
    showMessage(text, type) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        const form = document.getElementById('signupForm');
        form.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
    
    triggerCelebration() {
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createCelebrationParticle();
            }, i * 50);
        }
    }
    
    createCelebrationParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = '#00f2fe';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = startY + (Math.random() - 0.5) * 400;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        document.body.appendChild(particle);
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            particle.remove();
        };
    }
    
    // Scroll Effects
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);
        
        // Observe animated elements
        document.querySelectorAll('.feature-card, .countdown-item').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Interactive Elements
    setupInteractiveElements() {
        // Add hover effects to feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createHoverParticles(card);
            });
        });
        
        // Add click effects to buttons
        document.querySelectorAll('button, .social-link').forEach(element => {
            element.addEventListener('click', (e) => {
                this.createClickRipple(e);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('email-input')) {
                document.getElementById('signupForm').dispatchEvent(new Event('submit'));
            }
        });
    }
    
    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '3px';
                particle.style.height = '3px';
                particle.style.background = 'rgba(0, 242, 254, 0.6)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.left = `${rect.left + Math.random() * rect.width}px`;
                particle.style.top = `${rect.top + Math.random() * rect.height}px`;
                particle.style.zIndex = '1000';
                
                document.body.appendChild(particle);
                
                particle.animate([
                    { transform: 'translateY(0) scale(1)', opacity: 1 },
                    { transform: 'translateY(-20px) scale(0)', opacity: 0 }
                ], {
                    duration: 800,
                    easing: 'ease-out'
                }).onfinish = () => {
                    particle.remove();
                };
            }, i * 100);
        }
    }
    
    createClickRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.pointerEvents = 'none';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(4)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            ripple.remove();
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GeniusInPocket();
});

// Handle window resize for particles
window.addEventListener('resize', () => {
    // Recreate particles on resize for better distribution
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        if (Math.random() > 0.7) { // Only recreate some particles
            particle.style.left = `${Math.random() * window.innerWidth}px`;
        }
    });
});

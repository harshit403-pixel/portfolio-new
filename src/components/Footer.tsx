'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SOCIAL_ICONS, WIGGLE_CONFIG } from '@/lib/data';

function initWiggle(element: Element, intensity: number) {
    const target = element.querySelector('[data-wiggle-target]') || element;
    gsap.set(target, { transformOrigin: 'center center' });
    let tween: gsap.core.Tween;
    const onEnter = () => { tween = gsap.to(target, { rotation: intensity, duration: 0.17, repeat: -1, yoyo: true, ease: 'steps(1)' }); };
    const onLeave = () => { if (tween) { tween.kill(); gsap.to(target, { rotation: 0, duration: 0.3, ease: 'power2.out' }); } };
    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);
    return () => { element.removeEventListener('mouseenter', onEnter); element.removeEventListener('mouseleave', onLeave); };
}

export default function Footer() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        // ─── Map link underline draw/undraw ───
        const footerMapLink = document.querySelector('.footer-map-link');
        if (footerMapLink) {
            const mapSvgPaths = footerMapLink.querySelectorAll('.draw-btn__svg path');
            mapSvgPaths.forEach(path => {
                const length = (path as SVGPathElement).getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
            });
            const onEnter = () => gsap.fromTo(mapSvgPaths, { strokeDashoffset: (i, el) => (el as SVGPathElement).getTotalLength() }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, overwrite: true });
            const onLeave = () => gsap.to(mapSvgPaths, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
            footerMapLink.addEventListener('mouseenter', onEnter);
            footerMapLink.addEventListener('mouseleave', onLeave);
        }
        
        // ─── Credits pop-out ───
        const creditsWrapper = document.querySelector('.footer-credits-wrapper');
        if (creditsWrapper) {
            const creditsBox = creditsWrapper.querySelector('.credits-box');
            const creditsItems = creditsBox?.querySelectorAll('.credits-item');
            if (creditsBox && creditsItems) {
                const creditsBtn = creditsWrapper.querySelector('.footer-credits');
                const startY = creditsBtn ? (creditsBtn as HTMLElement).offsetHeight + 15 : 15;
                gsap.set(creditsBox, { visibility: 'hidden', width: 0, height: 0, opacity: 0, y: startY });
                
                const onEnter = () => {
                    gsap.set(creditsBox, { visibility: 'hidden', width: 'max-content', height: 'max-content' });
                    const dynWidth = (creditsBox as HTMLElement).offsetWidth;
                    const dynHeight = (creditsBox as HTMLElement).offsetHeight;
                    
                    gsap.set(creditsBox, { visibility: 'visible', width: 0, height: 0 });
                    gsap.set(creditsItems, { y: dynHeight });
                    
                    gsap.killTweensOf(creditsBox);
                    gsap.killTweensOf(creditsItems);
                    gsap.to(creditsBox, { width: dynWidth, height: dynHeight, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
                    gsap.to(creditsItems, { y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out', delay: 0.1 });
                };
                const onLeave = () => {
                    gsap.killTweensOf(creditsBox);
                    gsap.killTweensOf(creditsItems);
                    gsap.to(creditsBox, {
                        width: 0, height: 0, opacity: 0, y: startY, duration: 0.35, ease: 'power3.in',
                        onComplete: () => gsap.set(creditsBox, { visibility: 'hidden' })
                    });
                    const dynHeight = (creditsBox as HTMLElement).offsetHeight || 60;
                    gsap.to(creditsItems, { y: dynHeight, duration: 0.4, ease: 'power3.in', stagger: -0.03, delay: 0.1 });
                };
                creditsWrapper.addEventListener('mouseenter', onEnter);
                creditsWrapper.addEventListener('mouseleave', onLeave);
            }
        }

        // ─── Footer sticker pop-up on scroll ───
        const footerStickers = gsap.utils.toArray('.footer-sticker');
        const stickerRotations = [12, -10, 8, -12, 10, -8];
        gsap.set(footerStickers, { scale: 0, opacity: 0, transformOrigin: 'center bottom' });
        footerStickers.forEach((sticker, i) => gsap.set(sticker as Element, { rotation: stickerRotations[i % stickerRotations.length] }));
        gsap.to(footerStickers, {
            scale: 1, opacity: 1,
            rotation: (i) => stickerRotations[i % stickerRotations.length] * 0.7,
            duration: 0.7, ease: 'back.out(1.7)', stagger: 0.12,
            scrollTrigger: {
                trigger: '.footer-stickers',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // ─── Sticker cursor-velocity push ───
        footerStickers.forEach((sticker, i) => {
            const el = sticker as HTMLElement;
            const baseRotation = stickerRotations[i % stickerRotations.length] * 0.7;
            const PROXIMITY_RADIUS = 180, STRENGTH = 4, MAX_PUSH = 55, MIN_SPEED = 3;
            let prevX = 0, prevY = 0;
            const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));
            
            const onMove = (e: MouseEvent) => {
                const dx = e.clientX - prevX, dy = e.clientY - prevY;
                prevX = e.clientX; prevY = e.clientY;
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
                const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
                const onSticker = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
                const speed = Math.hypot(dx, dy);
                const isOverCreditsBox = (e.target as HTMLElement).closest('.credits-box') !== null;
                
                if (!onSticker && !isOverCreditsBox && dist < PROXIMITY_RADIUS && speed > MIN_SPEED) {
                    const falloff = 1 - (dist / PROXIMITY_RADIUS);
                    const pushX = clamp(dx * STRENGTH * falloff, MAX_PUSH);
                    const pushY = clamp(dy * STRENGTH * falloff, MAX_PUSH);
                    gsap.killTweensOf(el);
                    gsap.to(el, { x: pushX, y: pushY, rotation: baseRotation + pushX * 0.25, duration: 0.18, ease: 'power3.out' });
                    gsap.to(el, { x: 0, y: 0, rotation: baseRotation, duration: 1.1, ease: 'elastic.out(1, 0.35)', delay: 0.18 });
                }
            };
            document.addEventListener('mousemove', onMove);
        });

        // ─── Wiggle on footer interactive elements ───
        const wiggleTargets = [
            { selector: '.footer-column:first-child h3', key: 'jobHeading' },
            { selector: '.footer-map-link span', key: 'googleMap' },
            { selector: '.footer-email', key: 'email' },
            { selector: '.footer-whatsapp', key: 'whatsapp' },
            { selector: '.credits-name', key: 'socials' },
        ];
        
        wiggleTargets.forEach(({ selector, key }) => {
            document.querySelectorAll(selector).forEach(el => initWiggle(el, (WIGGLE_CONFIG as any)[key]));
        });
        document.querySelectorAll('.single-social').forEach(el => initWiggle(el, WIGGLE_CONFIG.socials));
    }, []);

    return (
        <div className="main-footer" id="contact">
            <div className="footer-inner">
                <div className="footer-top">
                    {/* Availability */}
                    <div className="footer-column">
                        <span className="footer-badge">open to work</span>
                        <h3>let&apos;s build together</h3>
                    </div>
  
                    {/* Contact */}
                    <div className="footer-column">
                        <span className="footer-badge">contact</span>
                        <a href="mailto:harshuraghu7999@gmail.com" className="footer-email">harshuraghu7999@gmail.com</a>
                        <div className="footer-socials" id="footer-socials">
                            {SOCIAL_ICONS.map(({ href, label, svg }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="single-social w-inline-block"
                                    aria-label={label}
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {/* Big Harshit text */}
                <div className="footer-bottom">
                    <div className="footer-big-text">
                        <h1 className="font-signature" style={{ fontSize: '18vw', fontWeight: 500, letterSpacing: '0', lineHeight: 1.2, margin: 0, textTransform: 'none', color: '#ffffff' }}>Harshit</h1>
                    </div>
                    {/* Stickers */}
                    <div className="footer-stickers">
                        <div className="footer-sticker sticker-smiley">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-smiley.svg" width="100%" alt="" data-scroll-animation-target="" aria-hidden="true" />
                        </div>
                        <div className="footer-sticker sticker-heart">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-heart.svg" width="100%" alt="" data-scroll-animation-target="" aria-hidden="true" />
                        </div>
                        <div className="footer-sticker sticker-hands">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-hands.svg" width="100%" alt="" data-scroll-animation-target="" aria-hidden="true" />
                        </div>
                        <div className="footer-sticker sticker-100">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-100.svg" width="100%" alt="" data-scroll-animation-target="" aria-hidden="true" />
                        </div>
                        <div className="footer-sticker sticker-camera">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-camera.svg" width="100%" alt="" aria-hidden="true" />
                        </div>
                        <div className="footer-sticker sticker-boom">
                            <img src="/Footer-Sticker%20SVG/footer-sticker-boom.svg" width="100%" alt="" data-scroll-animation-target="" aria-hidden="true" />
                        </div>
                    </div>
                    {/* Bottom row: credits */}
                    <div className="footer-bottom-row">
                        <div></div>
                        <div className="footer-credits-wrapper hidden md:block">
                            <div className="credits-box">
                                <div className="credits-content">
                                    <div className="credits-item credit-wiggle" style={{ fontFamily: 'Gilroy, sans-serif', fontSize: '0.8em' }}>
                                        <div className="overflow-wrapper"><span className="credits-label">designed & developed by</span></div>
                                        <div className="overflow-wrapper"><a href="#" onClick={(e) => e.preventDefault()} className="credits-name" data-wiggle-target="true">Harshit</a></div>
                                    </div>
                                </div>
                            </div>
                            <a href="#" onClick={(e) => e.preventDefault()} className="footer-credits" style={{ fontFamily: 'Gilroy, sans-serif' }}>credits</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

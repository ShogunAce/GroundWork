'use client';

import {useEffect, useState, type ReactNode} from 'react';

const cards = [
  {title:'Let it out.', text:'Observations, to-dos, half-formed ideas. Put them down just as they come.', image:'/img/field-journal.webp', detail:'A sentence is enough.', more:'A passing thought. A detail from your walk. There is no right way to begin—your own words are the raw material.'},
  {title:'Find the threads.', text:'Your notes become evidence-linked field records and manageable time blocks.', image:'/img/field-fern.webp', detail:'Look a little closer.', more:'Keep what you saw separate from what it might mean. Follow the evidence, leave room for uncertainty, and make space in your day.'},
  {title:'Take it outside.', text:'A personal workbook turns curiosity into safe missions and grounded project ideas.', image:'/img/creek.webp', detail:'Small steps have roots.', more:'Take a safe observation mission with you. Notice one thing, record what changes, and bring a little more understanding back.'},
];

export function FieldGuide() {
  const [open, setOpen] = useState<number|null>(null);
  return <div className="field-guide">
    <p className="guide-invitation">Three small moves. A little more possibility.<span>Tap a card to look closer <span aria-hidden="true">↗</span></span></p>
    <div className="field-cards">
      {cards.map((card, index) => <button key={card.title} className={`field-card${open===index?' is-open':''}`}
        aria-expanded={open===index} aria-label={`${open===index?'Close':'Explore'} ${card.title}`}
        onClick={()=>setOpen(open===index?null:index)} onKeyDown={e=>{if(e.key==='Escape')setOpen(null);}}>
        <span className="field-card-turn">
          <span className="field-card-face field-card-front" aria-hidden={open===index}>
            <span className="card-image-window"><img src={card.image} alt="" loading="lazy" width="800" height="500"/></span>
            <span className="field-card-title">{card.title}</span>
            <span className="field-card-text">{card.text}</span>
            <span className="card-open"><span>Look closer</span><span className="card-orbit" aria-hidden="true">↗</span></span>
          </span>
          <span className="field-card-face field-card-back" aria-hidden={open!==index}>
            <img src={card.image} alt="" loading="lazy" width="800" height="1000"/>
            <span className="card-close" aria-hidden="true">×</span>
            <span className="card-glass"><span className="field-card-title">{card.detail}</span><span className="field-card-text">{card.more}</span><span className="card-return">Tap to turn back</span></span>
          </span>
        </span>
      </button>)}
    </div>
  </div>;
}

export function CareSection({mark,onBegin}:{mark:ReactNode;onBegin:()=>void}) {
  const words='Your notes are a starting point. Never a diagnosis. Every connection keeps its evidence. Every mission respects the living world. And every day leaves room for being human.';
  return <section className="principles" id="principles">
    <div className="care-image"><img className="reveal-image" src="/img/field-fern.webp" alt="" loading="lazy" width="1440" height="900"/></div>
    <div className="care-content">{mark}<h2>Curiosity,<br/><em>with care.</em></h2>
      <p className="care-copy" aria-label={words}>{words.split(' ').map((word,i)=><span key={i} aria-hidden="true">{word} </span>)}</p>
      <button className="primary" onClick={onBegin}>Make a little groundwork <span className="arrow" aria-hidden="true">↗</span></button>
    </div>
    <span className="care-caption">Look closely. Leave gently.</span>
  </section>;
}

/** Progressive enhancement: content stays visible if animation cannot load. */
export function ExperienceMotion({viewKey}:{viewKey:string}) {
  useEffect(()=>{
    let disposed=false;
    let cleanup=()=>{};
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    async function setup(){
      cleanup();
      if(motion.matches||disposed)return;
      try {
        const [{gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);
        if(disposed||motion.matches)return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx=gsap.context(()=>{
          gsap.utils.toArray<HTMLElement>('.intro>h2,.guide-invitation,.field-card,.section-top,.desk .panel,.workbook-banner,.workbook-cover,.workbook-section').forEach(el=>{
            gsap.from(el,{y:28,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}});
          });
          gsap.from('.care-image img',{scale:.86,opacity:.5,ease:'none',scrollTrigger:{trigger:'.principles',start:'top 95%',end:'top 25%',scrub:1}});
          gsap.from('.care-copy span',{opacity:.35,stagger:.035,ease:'none',scrollTrigger:{trigger:'.care-content',start:'top 85%',end:'center 60%',scrub:1}});
        });
        cleanup=()=>ctx.revert();
        ScrollTrigger.refresh();
      }catch{/* The complete page remains usable without animation. */}
    }
    void setup();
    motion.addEventListener('change',setup);
    return()=>{disposed=true;motion.removeEventListener('change',setup);cleanup();};
  },[viewKey]);
  return null;
}

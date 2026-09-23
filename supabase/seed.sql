-- =====================================================================
-- Go2Viral — starter content (run AFTER schema.sql). Safe to edit later
-- from the dashboard. Re-running it resets the home page content.
-- =====================================================================

update public.site_settings set
  brand_color = '#5428B3',
  whatsapp    = '201000000000',
  socials     = $j$[
    {"platform":"facebook","url":"https://facebook.com/"},
    {"platform":"instagram","url":"https://instagram.com/"},
    {"platform":"tiktok","url":"https://tiktok.com/"}
  ]$j$::jsonb,
  ticker = $j${
    "ar":["للأطباء والعيادات بس","تحليل مجاني لتسويق عيادتك","إعلانات بتجيب حجوزات","براند شخصي يثق فيه المرضى"],
    "en":["For doctors and clinics only","Free marketing audit for your clinic","Ads that bring bookings","A personal brand patients trust"]
  }$j$::jsonb,
  seo = $j${
    "title":{"ar":"Go2Viral — تسويق للأطباء والعيادات","en":"Go2Viral — Marketing for doctors & clinics"},
    "description":{"ar":"وكالة تسويق متخصصة في الأطباء والعيادات. إعلانات بتجيب حجوزات، براند شخصي، صفحات هبوط وفيديو.","en":"A marketing agency for doctors and clinics: ads that bring bookings, personal branding, landing pages and video."}
  }$j$::jsonb,
  footer = $j${"tagline":{"ar":"نمو حقيقي، للعيادات الحقيقية.","en":"Real growth, for real clinics."}}$j$::jsonb
where id = 1;

-- categories -------------------------------------------------------------
insert into public.categories (id, slug, name, color, sort) values
  ('10000000-0000-0000-0000-000000000001','derma',  '{"ar":"جلدية","en":"Dermatology"}', '#E0197D', 1),
  ('10000000-0000-0000-0000-000000000002','dental', '{"ar":"أسنان","en":"Dental"}',      '#4757E8', 2),
  ('10000000-0000-0000-0000-000000000003','aesth',  '{"ar":"تجميل","en":"Aesthetics"}',  '#5428B3', 3),
  ('10000000-0000-0000-0000-000000000004','kids',   '{"ar":"أطفال","en":"Pediatrics"}',  '#1E9CC0', 4),
  ('10000000-0000-0000-0000-000000000005','ivf',    '{"ar":"حقن مجهري","en":"IVF"}',      '#2A2440', 5)
on conflict (id) do update set name = excluded.name, color = excluded.color, sort = excluded.sort;

-- doctors (sample — replace from the dashboard) ---------------------------
insert into public.doctors (id, name, specialty_id, code, color, sort) values
  ('20000000-0000-0000-0000-000000000001','{"ar":"د. سارة منصور","en":"Dr. Sara Mansour"}','10000000-0000-0000-0000-000000000001','0217 4418 9063','#E0197D',1),
  ('20000000-0000-0000-0000-000000000002','{"ar":"د. كريم عادل","en":"Dr. Karim Adel"}',  '10000000-0000-0000-0000-000000000002','5852 6495 4853','#4757E8',2),
  ('20000000-0000-0000-0000-000000000003','{"ar":"د. منى الشريف","en":"Dr. Mona Elsherif"}','10000000-0000-0000-0000-000000000003','6584 8254 9684','#5428B3',3),
  ('20000000-0000-0000-0000-000000000004','{"ar":"د. عمر حسني","en":"Dr. Omar Hosny"}',   '10000000-0000-0000-0000-000000000004','4278 8678 5973','#1E9CC0',4),
  ('20000000-0000-0000-0000-000000000005','{"ar":"د. هالة فؤاد","en":"Dr. Hala Fouad"}',  '10000000-0000-0000-0000-000000000005','7954 6792 9634','#2A2440',5)
on conflict (id) do update set name = excluded.name, specialty_id = excluded.specialty_id, code = excluded.code, color = excluded.color;

-- home page ----------------------------------------------------------------
insert into public.pages (id, slug, title, is_home, in_nav, sort) values
  ('30000000-0000-0000-0000-000000000001','home','{"ar":"الرئيسية","en":"Home"}', true, false, 0)
on conflict (id) do nothing;

delete from public.sections where page_id = '30000000-0000-0000-0000-000000000001';

insert into public.sections (id, page_id, type, anchor, nav_label, sort, content) values
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','hero','top',null,1,$j${
  "badge":{"ar":"وكالة تسويق للأطباء والعيادات بس","en":"A marketing agency for doctors and clinics only"},
  "title":{"ar":"املا عيادتك\nبالمرضى\nالمناسبين.","en":"Fill your clinic\nwith the right\npatients."},
  "lead":{"ar":"حملات إعلانية بتجيب حجوزات، مش لايكات. وبراند شخصي بيخلّي المريض يثق فيك قبل ما يدخل العيادة.","en":"Ad campaigns that bring bookings, not likes, and a personal brand that earns trust before the first visit."},
  "primary":{"label":{"ar":"احصل على تحليل مجاني","en":"Get a free audit"},"href":"#contact"},
  "secondary":{"label":{"ar":"شوف شغلنا","en":"See our work"},"href":"#work"},
  "trust":[{"text":{"ar":"محتوى آمن طبياً","en":"Medically safe content"}},{"text":{"ar":"تقارير أسبوعية","en":"Weekly reports"}},{"text":{"ar":"تصوير الفيديو علينا","en":"We shoot the video"}}],
  "meter":{"title":{"ar":"جدول العيادة.","en":"Clinic schedule."},"footer":{"ar":"من 50 ميعاد الأسبوع ده","en":"of 50 slots this week"}},
  "toasts":[{"title":{"ar":"حجز جديد: كشف جلدية","en":"New booking: skin consult"},"sub":{"ar":"من دقيقتين","en":"2 min ago"}},{"title":{"ar":"«عايزة أحجز يوم الخميس»","en":"“Can I book Thursday?”"},"sub":{"ar":"رسالة واتساب","en":"WhatsApp message"}},{"title":{"ar":"حجز جديد: تنظيف أسنان","en":"New booking: dental cleaning"},"sub":{"ar":"دلوقتي","en":"Just now"}}]
}$j$::jsonb),
('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','doctors','clinics',null,2,$j${
  "title":{"ar":"عيادات وأطباء بننمّيهم.","en":"Clinics and doctors we grow."},
  "subtitle":{"ar":"جلدية، أسنان، تجميل، أطفال، وحقن مجهري. كل تخصص ليه جمهوره ولغته.","en":"Dermatology, dental, aesthetics, pediatrics and IVF. Every specialty has its own audience and language."}
}$j$::jsonb),
('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','services','services','{"ar":"خدماتنا","en":"Services"}',3,$j${
  "tag":{"ar":"كل حاجة في مكان واحد","en":"Everything in one place"},
  "title":{"ar":"من الإعلان لحد الحجز.","en":"From the ad to the booking."},
  "lead":{"ar":"فريق واحد ماسك رحلة المريض كلها: يشوفك، يثق فيك، ويحجز.","en":"One team for the whole patient journey: they see you, trust you, and book."},
  "cards":[
    {"variant":"brand","title":{"ar":"البراند الشخصي للدكتور","en":"The doctor's personal brand"},"text":{"ar":"خلّي اسمك هو اللي المرضى بيدوّروا عليه وبيثقوا فيه.","en":"Make your name the one patients search for and trust."},"chips":{"ar":"التمركز، المحتوى، السمعة","en":"Positioning, Content, Reputation"}},
    {"variant":"ads","title":{"ar":"الحملات الإعلانية","en":"Ad campaigns"},"text":{"ar":"حملات متصممة عشان تجيب حجوزات، مش لايكات.","en":"Campaigns built for bookings, not likes."},"chips":{"ar":"Meta، Google، TikTok","en":"Meta, Google, TikTok"}},
    {"variant":"landing","title":{"ar":"صفحات الهبوط","en":"Landing pages"},"text":{"ar":"صفحات سريعة على الموبايل بتحوّل الضغطة لمكالمة.","en":"Fast mobile pages that turn a tap into a call."},"chips":{"ar":"تصميم، سرعة، تتبع","en":"Design, Speed, Tracking"}},
    {"variant":"video","title":{"ar":"الفيديو والمحتوى","en":"Video & content"},"text":{"ar":"ريلز وفيديوهات توعوية وإعلانات، بنصورها على مواعيد عيادتك.","en":"Reels, educational videos and ads, shot around your clinic hours."},"chips":{"ar":"ريلز، إعلانات، توعوي","en":"Reels, Ads, Educational"}},
    {"variant":"cta","title":{"ar":"مش عارف تبدأ منين؟","en":"Not sure where to start?"},"text":{"ar":"هنراجع تسويق عيادتك ونقولك أكبر فرصة نمو عندك. التحليل مجاني.","en":"We'll review your clinic's marketing and show you the biggest growth opportunity. Free."},"cta_label":{"ar":"احصل على تحليل مجاني","en":"Get a free audit"},"cta_href":"#contact"}
  ]
}$j$::jsonb),
('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','work','work','{"ar":"شغلنا","en":"Work"}',4,$j${
  "tag":{"ar":"الشغل بيتكلم","en":"The work speaks"},
  "title":{"ar":"صفحات بتحوّل الضغطة لحجز.","en":"Pages that turn taps into bookings."},
  "lead":{"ar":"شغل حقيقي، وكل صفحة معمولة عشان هدف واحد واضح.","en":"Real work. Every page is built for one clear goal."}
}$j$::jsonb),
('40000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001','stats','results','{"ar":"نتايجنا","en":"Results"}',5,$j${
  "tag":{"ar":"نتايج العيادة بتحس بيها","en":"Results you can feel"},
  "title":{"ar":"أرقام تفرق.","en":"Numbers that matter."},
  "stats":[{"value":"+212%","label":{"ar":"زيادة الحجوزات في 90 يوم","en":"more bookings in 90 days"}},{"value":"-48%","label":{"ar":"تكلفة الحجز","en":"cost per booking"}},{"value":"3.8x","label":{"ar":"عائد الإعلانات","en":"return on ad spend"}},{"value":"24/7","label":{"ar":"محتوى شغّال","en":"content working"}}],
  "case":{"label":{"ar":"دراسة حالة: عيادة جلدية","en":"Case study: dermatology clinic"},"title":{"ar":"نمو ثابت، مش ضربة حظ.","en":"Steady growth, not luck."},"text":{"ar":"من أول شهر للتالت، الحجوزات بتزيد مع كل تحسين.","en":"From month one to three, bookings grow with every optimization."},
    "bars":[{"label":{"ar":"الشهر الأول","en":"Month 1"},"value":32},{"label":{"ar":"التاني","en":"Month 2"},"value":61},{"label":{"ar":"التالت","en":"Month 3"},"value":100}]},
  "compare":{"label":{"ar":"قبل وبعد","en":"Before & after"},"title":{"ar":"نفس الميزانية، حجوزات أكتر.","en":"Same budget, more bookings."},"text":{"ar":"لما الإعلان يوصل للمريض الصح، تكلفة الحجز الواحد بتنزل.","en":"When the ad reaches the right patient, each booking costs less."},
    "before_label":{"ar":"قبل","en":"Before"},"before_value":"100%","after_label":{"ar":"بعد","en":"After"},"after_value":"52%"}
}$j$::jsonb),
('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001','process','process','{"ar":"طريقة الشغل","en":"Process"}',6,$j${
  "tag":{"ar":"ببساطة","en":"Simply put"},
  "title":{"ar":"طريقة شغل واضحة.","en":"A clear way of working."},
  "lead":{"ar":"أربع خطوات، وكل خطوة ليها تقرير تشوفه بعينك.","en":"Four steps, each with a report you can see."},
  "steps":[{"title":{"ar":"نفهم عيادتك","en":"Understand your clinic"},"text":{"ar":"نبدأ بالمشكلة والهدف قبل أي إعلان.","en":"We start with the problem and the goal, before any ad."}},{"title":{"ar":"نبني الخطة","en":"Build the plan"},"text":{"ar":"الرسالة، الجمهور، المحتوى، والقنوات المناسبة.","en":"Message, audience, content and the right channels."}},{"title":{"ar":"نطلق ونقيس","en":"Launch and measure"},"text":{"ar":"نجرّب بسرعة ونوقف اللي مش بيجيب نتيجة.","en":"We test fast and stop what doesn't work."}},{"title":{"ar":"نكبّر الصح","en":"Scale what works"},"text":{"ar":"نضاعف الاستثمار في اللي بيحجز فعلاً.","en":"We double down on what actually books."}}]
}$j$::jsonb),
('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001','videos','content',null,7,$j${
  "tag":{"ar":"المحتوى اللي بيشتغل","en":"Content that works"},
  "title":{"ar":"فيديوهات المرضى بيتفرجوا عليها فعلاً.","en":"Videos patients actually watch."},
  "lead":{"ar":"ريلز براند شخصي، محتوى توعوي، وإعلانات. التصوير والمونتاج علينا.","en":"Personal-brand reels, educational content and ads. We shoot and edit."},
  "cta_label":{"ar":"عايز محتوى زي ده","en":"I want content like this"},"cta_href":"#contact"
}$j$::jsonb),
('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001','contact','contact','{"ar":"تواصل","en":"Contact"}',8,$j${
  "title":{"ar":"جاهز تملا عيادتك؟","en":"Ready to fill your clinic?"},
  "lead":{"ar":"احجز مكالمة مجانية ونشوف مع بعض أكبر فرصة نمو عندك.","en":"Book a free call and we'll find your biggest growth opportunity together."},
  "form_title":{"ar":"ابعتلنا بياناتك","en":"Send us your details"},
  "meter_title":{"ar":"جدول عيادتك.","en":"Your schedule."},
  "meter_empty":{"ar":"لسه فيه مكان كتير فاضي","en":"Plenty of empty slots"},
  "meter_full":{"ar":"ده اللي بنشتغل عليه","en":"This is what we work towards"},
  "whatsapp_label":{"ar":"أو اتكلم معانا على واتساب على طول","en":"Or message us on WhatsApp"},
  "success":{"ar":"وصلنا طلبك. افتح واتساب وابعت الرسالة عشان نحدد ميعاد المكالمة.","en":"Got it. Open WhatsApp and send the message so we can schedule your call."}
}$j$::jsonb);

-- sample work items (replace from the dashboard) --------------------------
insert into public.items (section_id, kind, title, subtitle, url, category_id, doctor_id, sort) values
('40000000-0000-0000-0000-000000000004','live','{"ar":"Feel good in your skin.","en":"Feel good in your skin."}','{"ar":"د. سارة منصور","en":"Dr. Sara Mansour"}','https://go2viral.vercel.app','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',1),
('40000000-0000-0000-0000-000000000004','live','{"ar":"A smile worth sharing.","en":"A smile worth sharing."}','{"ar":"د. كريم عادل","en":"Dr. Karim Adel"}','https://go2viral.vercel.app','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',2),
('40000000-0000-0000-0000-000000000004','image','{"ar":"Care that moves you.","en":"Care that moves you."}','{"ar":"د. منى الشريف","en":"Dr. Mona Elsherif"}',null,'10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003',3),
('40000000-0000-0000-0000-000000000004','image','{"ar":"Little ones, big care.","en":"Little ones, big care."}','{"ar":"د. عمر حسني","en":"Dr. Omar Hosny"}',null,'10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004',4),
('40000000-0000-0000-0000-000000000004','image','{"ar":"Your journey, with experts.","en":"Your journey, with experts."}','{"ar":"د. هالة فؤاد","en":"Dr. Hala Fouad"}',null,'10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005',5),
('40000000-0000-0000-0000-000000000007','video','{"ar":"من التصوير للنشر","en":"From shoot to post"}','{"ar":"الشوريل","en":"Showreel"}',null,null,null,1),
('40000000-0000-0000-0000-000000000007','video','{"ar":"ليه بشرتك بتنشف في الشتا؟","en":"Why does skin dry out in winter?"}','{"ar":"براند شخصي","en":"Personal brand"}',null,'10000000-0000-0000-0000-000000000001',null,2),
('40000000-0000-0000-0000-000000000007','video','{"ar":"3 غلطات في تنظيف الأسنان","en":"3 brushing mistakes"}','{"ar":"توعوي","en":"Educational"}',null,'10000000-0000-0000-0000-000000000002',null,3);

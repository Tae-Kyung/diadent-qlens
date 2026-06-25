"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload,
  BarChart3,
  Shield,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  FileCheck,
  ArrowRight,
  CheckCircle,
  Activity,
} from "lucide-react";
import { LandingControls } from "@/components/landing-controls";
import { useState, useEffect, useCallback } from "react";
import type { Locale } from "@/lib/i18n/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";
import ko from "@/lib/i18n/dictionaries/ko";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";
import ru from "@/lib/i18n/dictionaries/ru";
import fr from "@/lib/i18n/dictionaries/fr";

type Dict = typeof ko;
const dicts: Record<Locale, Dict> = { ko, en: en as unknown as Dict, zh: zh as unknown as Dict, ru: ru as unknown as Dict, fr: fr as unknown as Dict };

const landing = {
  ko: {
    features: "기능", casestudy: "분석 사례", howItWorks: "사용 방법",
    login: "로그인", cta: "무료로 시작",
    heroTag: "치과 기구 제조 품질관리 플랫폼",
    heroTitle1: "측정 데이터를", heroTitle2: "한눈에 분석", heroTitle3: "하다",
    heroDesc: "이미지측정기에서 내보낸 Excel 파일을 업로드하면, 제품 형상 복원 · 공정능력(Cp/Cpk) · 이상치 검출까지 자동으로 완료됩니다.",
    ctaFull: "무료로 시작하기", ctaCase: "분석 사례 보기",
    trust1: "설치 불필요", trust2: "3초 만에 분석 완료", trust3: "AI 기반 인사이트",
    painTitle: "이런 고민, 하고 계시지 않나요?",
    pain1t: "Excel에 쌓이기만 하는 측정 데이터", pain1d: "매일 측정하지만, 분석은 수작업. 추세를 놓치고 있진 않은지 불안합니다.",
    pain2t: "이상치를 눈으로 찾는 비효율", pain2d: "수백 개 샘플에서 불량을 일일이 확인하느라 시간이 낭비됩니다.",
    pain3t: "보고서 작성에 반나절", pain3d: "차트 만들고, 수치 정리하고, 판정 내리는 데 본업보다 시간이 걸립니다.",
    featTitle: "QLens가 해결합니다", featSub: "Excel 업로드 한 번으로, 분석부터 보고서까지",
    f1t: "Excel 업로드 → 자동 분석", f1d: "측정장비가 내보낸 .xlsx 파일을 그대로 올리세요. 제품·사이즈·측정 포인트를 자동으로 인식합니다.",
    f2t: "형상 프로파일 복원", f2d: "측정 포인트 평균값으로 실제 제품 단면 형상을 시각화합니다. ±3σ 산포 밴드로 공정 변동을 확인합니다.",
    f3t: "공정능력 자동 판정", f3d: "규격(USL/LSL)을 등록하면 포인트별 Cp·Cpk를 자동 계산합니다. 1.33 미만이면 경고로 표시합니다.",
    f4t: "이상치 자동 검출", f4d: "규격 이탈(OOS)과 통계 이탈(±4σ)을 자동으로 찾아 사유와 이탈 정도(σ)를 함께 보여줍니다.",
    f5t: "AI 분석가에게 질문", f5d: "'팁 직경이 가장 불안정한 사이즈는?' 같은 질문을 한국어로 하면, 통계 데이터를 근거로 답변합니다.",
    f6t: "원클릭 PDF 보고서", f6d: "대시보드 화면을 PDF로 바로 내보낼 수 있습니다. 차트·통계·판정이 포함된 보고서를 즉시 공유하세요.",
    caseTitle: "실제 분석 사례", caseSub: "치과재료(거타퍼차 콘) 측정 데이터 289개 샘플 분석 결과",
    stepsTitle: "3단계로 시작하세요",
    s1t: "Excel 업로드", s1d: "측정장비에서 내보낸 .xlsx 파일을 선택하면 제품·사이즈가 자동으로 등록됩니다.",
    s2t: "대시보드 확인", s2d: "형상 프로파일, 히스토그램, 관리도, KPI 카드로 품질 현황을 한눈에 파악합니다.",
    s3t: "규격 등록 (옵션)", s3d: "규격을 등록하면 Cpk·합격률이 활성화됩니다. 없어도 기본 분석은 가능합니다.",
    forTitle: "이런 분들을 위해 만들었습니다",
    for1: "매일 측정 데이터를 Excel로 관리하는 QC 담당자",
    for2: "공정능력 보고서를 수작업으로 만드는 품질 팀장",
    for3: "현장 품질 현황을 빠르게 파악하고 싶은 경영진",
    for4: "이미지측정기(LM-X 등) 데이터를 활용하고 싶은 제조 SME",
    ctaBottom: "측정 데이터, 더 이상 방치하지 마세요",
    ctaBottomSub: "Excel 파일 하나면 충분합니다. 지금 바로 업로드하고 품질 인사이트를 확인하세요.",
  },
  en: {
    features: "Features", casestudy: "Case Study", howItWorks: "How It Works",
    login: "Log in", cta: "Get Started",
    heroTag: "Quality control platform for dental instrument manufacturing",
    heroTitle1: "Analyze measurement", heroTitle2: "data at a glance", heroTitle3: "",
    heroDesc: "Upload an Excel file from your measurement device and automatically get shape reconstruction, process capability (Cp/Cpk), and anomaly detection.",
    ctaFull: "Get Started Free", ctaCase: "View Case Study",
    trust1: "No installation", trust2: "Analysis in 3 sec", trust3: "AI-powered insights",
    painTitle: "Sound familiar?",
    pain1t: "Measurement data piling up in Excel", pain1d: "You measure every day, but analysis is manual. Trends might be slipping through.",
    pain2t: "Finding anomalies by eye", pain2d: "Hundreds of samples checked one by one — time wasted.",
    pain3t: "Half a day writing reports", pain3d: "Making charts, organizing numbers, writing judgments — it takes longer than the actual work.",
    featTitle: "QLens solves it", featSub: "From upload to report in one step",
    f1t: "Excel Upload → Auto Analysis", f1d: "Upload .xlsx files directly. Product, size, and measurement points are recognized automatically.",
    f2t: "Shape Profile Reconstruction", f2d: "Visualize the actual product cross-section with mean values. ±3σ bands show process variation.",
    f3t: "Auto Process Capability", f3d: "Register specs (USL/LSL) and Cp/Cpk are calculated per point. Warnings for values below 1.33.",
    f4t: "Automatic Anomaly Detection", f4d: "OOS and statistical outliers (±4σ) are found automatically with reasons and deviation levels.",
    f5t: "Ask the AI Analyst", f5d: "Ask questions like 'Which size has the most unstable D0?' and get data-backed answers.",
    f6t: "One-Click PDF Report", f6d: "Export dashboard views to PDF instantly. Share reports with charts, stats, and judgments.",
    caseTitle: "Real Case Study", caseSub: "Analysis of 289 dental material (gutta-percha cone) measurement samples",
    stepsTitle: "Get started in 3 steps",
    s1t: "Upload Excel", s1d: "Select an .xlsx file from your measurement device and products are auto-registered.",
    s2t: "Check Dashboard", s2d: "View quality status with shape profiles, histograms, control charts, and KPI cards.",
    s3t: "Register Specs (Optional)", s3d: "Register specs to enable Cpk and pass rates. Basic analysis works without them.",
    forTitle: "Built for you",
    for1: "QC managers handling measurement data in Excel daily",
    for2: "Quality team leads manually creating capability reports",
    for3: "Executives wanting quick visibility into production quality",
    for4: "Manufacturing SMEs using image measurement devices (LM-X, etc.)",
    ctaBottom: "Stop leaving measurement data unanalyzed",
    ctaBottomSub: "One Excel file is all you need. Upload now and discover quality insights.",
  },
  zh: {
    features: "功能", casestudy: "案例分析", howItWorks: "使用方法",
    login: "登录", cta: "免费开始",
    heroTag: "牙科器械制造质量管控平台",
    heroTitle1: "测量数据", heroTitle2: "一目了然", heroTitle3: "",
    heroDesc: "上传图像测量仪导出的 Excel 文件，自动完成产品形状复原、过程能力(Cp/Cpk)和异常值检测。",
    ctaFull: "免费开始", ctaCase: "查看案例",
    trust1: "无需安装", trust2: "3秒完成分析", trust3: "AI 驱动洞察",
    painTitle: "您是否也有这样的困扰？",
    pain1t: "Excel 中堆积的测量数据", pain1d: "每天测量，分析却靠手工。趋势可能正在被忽略。",
    pain2t: "肉眼查找异常值的低效", pain2d: "数百个样本逐一确认，浪费大量时间。",
    pain3t: "写报告要半天", pain3d: "制图、整理数据、做判定，比本职工作还费时。",
    featTitle: "QLens 来解决", featSub: "一次上传，从分析到报告全搞定",
    f1t: "Excel 上传 → 自动分析", f1d: "直接上传 .xlsx 文件，自动识别产品、规格和测量点。",
    f2t: "形状轮廓复原", f2d: "用测量点均值可视化产品截面形状，±3σ 波动带显示工艺变异。",
    f3t: "过程能力自动判定", f3d: "注册规格(USL/LSL)后自动计算 Cp/Cpk，低于1.33时发出警告。",
    f4t: "异常值自动检测", f4d: "自动检测规格超标(OOS)和统计偏差(±4σ)，附带原因和偏差程度。",
    f5t: "向 AI 分析师提问", f5d: "用自然语言提问，如「哪个规格的尖端直径最不稳定？」获得数据支撑的回答。",
    f6t: "一键 PDF 报告", f6d: "将仪表板导出为 PDF，即时分享含图表、统计和判定的报告。",
    caseTitle: "实际分析案例", caseSub: "牙科材料(古塔胶尖) 289个样本测量数据分析结果",
    stepsTitle: "三步开始",
    s1t: "上传 Excel", s1d: "选择测量仪导出的 .xlsx 文件，产品和规格自动注册。",
    s2t: "查看仪表板", s2d: "通过形状轮廓、直方图、控制图和 KPI 卡了解质量状况。",
    s3t: "注册规格（可选）", s3d: "注册规格后启用 Cpk 和合格率。未注册也可进行基本分析。",
    forTitle: "专为您打造",
    for1: "每天用 Excel 管理测量数据的 QC 负责人",
    for2: "手工制作过程能力报告的质量团队负责人",
    for3: "希望快速掌握生产质量的管理层",
    for4: "使用图像测量仪(LM-X等)的制造业中小企业",
    ctaBottom: "别再让测量数据闲置了",
    ctaBottomSub: "一个 Excel 文件就够了。立即上传，发现质量洞察。",
  },
  ru: {
    features: "Функции", casestudy: "Кейс", howItWorks: "Как начать",
    login: "Войти", cta: "Начать",
    heroTag: "Платформа контроля качества стоматологических инструментов",
    heroTitle1: "Анализ данных", heroTitle2: "измерений", heroTitle3: " наглядно",
    heroDesc: "Загрузите Excel-файл из измерительного прибора — восстановление формы, расчёт Cp/Cpk и обнаружение аномалий выполняются автоматически.",
    ctaFull: "Начать бесплатно", ctaCase: "Смотреть кейс",
    trust1: "Без установки", trust2: "Анализ за 3 сек", trust3: "AI-аналитика",
    painTitle: "Знакомая ситуация?",
    pain1t: "Данные копятся в Excel", pain1d: "Измерения каждый день, но анализ вручную. Тренды могут ускользать.",
    pain2t: "Поиск аномалий вручную", pain2d: "Сотни образцов проверяются по одному — время тратится впустую.",
    pain3t: "Полдня на отчёт", pain3d: "Графики, цифры, заключения — занимает больше времени, чем основная работа.",
    featTitle: "QLens решает это", featSub: "От загрузки до отчёта — в один шаг",
    f1t: "Excel → автоанализ", f1d: "Загрузите .xlsx файл — продукт, размер и точки определяются автоматически.",
    f2t: "Восстановление профиля", f2d: "Визуализация сечения по средним значениям. Полосы ±3σ показывают вариацию процесса.",
    f3t: "Автоматический расчёт Cpk", f3d: "Зарегистрируйте спецификации (USL/LSL) — Cp/Cpk рассчитываются по каждой точке.",
    f4t: "Обнаружение аномалий", f4d: "OOS и статистические выбросы (±4σ) находятся автоматически с причинами и отклонениями.",
    f5t: "Спросите AI-аналитика", f5d: "Задавайте вопросы на естественном языке и получайте ответы на основе данных.",
    f6t: "PDF-отчёт в один клик", f6d: "Экспортируйте дашборд в PDF — графики, статистика и заключения включены.",
    caseTitle: "Реальный кейс", caseSub: "Анализ 289 образцов стоматологического материала (гуттаперчевые штифты)",
    stepsTitle: "Начните за 3 шага",
    s1t: "Загрузите Excel", s1d: "Выберите .xlsx файл — продукты и размеры регистрируются автоматически.",
    s2t: "Проверьте дашборд", s2d: "Профили, гистограммы, контрольные карты и KPI — всё на одном экране.",
    s3t: "Спецификации (опционально)", s3d: "Добавьте спецификации для Cpk и процента годных. Базовый анализ работает и без них.",
    forTitle: "Создано для вас",
    for1: "QC-специалисты, работающие с данными в Excel каждый день",
    for2: "Руководители качества, вручную создающие отчёты",
    for3: "Руководство, желающее быстро оценить качество",
    for4: "Производственные МСП, использующие измерительные приборы (LM-X и др.)",
    ctaBottom: "Хватит оставлять данные без анализа",
    ctaBottomSub: "Одного файла Excel достаточно. Загрузите и откройте инсайты качества.",
  },
  fr: {
    features: "Fonctionnalités", casestudy: "Étude de cas", howItWorks: "Comment ça marche",
    login: "Connexion", cta: "Commencer",
    heroTag: "Plateforme de contrôle qualité pour instruments dentaires",
    heroTitle1: "Analysez vos données", heroTitle2: "en un coup d'œil", heroTitle3: "",
    heroDesc: "Téléchargez un fichier Excel depuis votre appareil de mesure : reconstruction de forme, capabilité (Cp/Cpk) et détection d'anomalies, tout est automatique.",
    ctaFull: "Commencer gratuitement", ctaCase: "Voir l'étude de cas",
    trust1: "Aucune installation", trust2: "Analyse en 3 sec", trust3: "Insights par IA",
    painTitle: "Ça vous parle ?",
    pain1t: "Des données qui s'accumulent dans Excel", pain1d: "Vous mesurez tous les jours mais l'analyse reste manuelle. Les tendances passent inaperçues.",
    pain2t: "Chercher les anomalies à l'œil", pain2d: "Des centaines d'échantillons vérifiés un par un — du temps perdu.",
    pain3t: "Une demi-journée pour un rapport", pain3d: "Graphiques, chiffres, conclusions — plus long que le travail lui-même.",
    featTitle: "QLens résout tout", featSub: "Du téléchargement au rapport en une étape",
    f1t: "Excel → Analyse auto", f1d: "Téléchargez vos .xlsx. Produit, taille et points de mesure sont reconnus automatiquement.",
    f2t: "Reconstruction du profil", f2d: "Visualisez la section réelle du produit. Les bandes ±3σ montrent la variation du procédé.",
    f3t: "Capabilité automatique", f3d: "Enregistrez les spécifications (USL/LSL) et Cp/Cpk sont calculés par point.",
    f4t: "Détection d'anomalies", f4d: "OOS et écarts statistiques (±4σ) sont trouvés automatiquement avec raisons et niveaux.",
    f5t: "Demandez à l'analyste IA", f5d: "Posez des questions en langage naturel et obtenez des réponses basées sur les données.",
    f6t: "Rapport PDF en un clic", f6d: "Exportez le tableau de bord en PDF. Partagez des rapports avec graphiques et statistiques.",
    caseTitle: "Étude de cas réelle", caseSub: "Analyse de 289 échantillons de matériau dentaire (cônes de gutta-percha)",
    stepsTitle: "Démarrez en 3 étapes",
    s1t: "Téléchargez Excel", s1d: "Sélectionnez un .xlsx — produits et tailles sont enregistrés automatiquement.",
    s2t: "Consultez le tableau de bord", s2d: "Profils, histogrammes, cartes de contrôle et KPI — tout sur un écran.",
    s3t: "Spécifications (optionnel)", s3d: "Ajoutez des spécifications pour activer Cpk et taux de conformité.",
    forTitle: "Conçu pour vous",
    for1: "Responsables QC gérant des données de mesure dans Excel au quotidien",
    for2: "Chefs d'équipe qualité créant des rapports manuellement",
    for3: "Dirigeants souhaitant une visibilité rapide sur la qualité",
    for4: "PME industrielles utilisant des appareils de mesure (LM-X, etc.)",
    ctaBottom: "Arrêtez de laisser vos données dormir",
    ctaBottomSub: "Un seul fichier Excel suffit. Téléchargez et découvrez vos insights qualité.",
  },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("qlens-locale") as Locale | null;
    if (saved && landing[saved]) setLocale(saved);
  }, []);

  const l = landing[locale];

  const handleLocale = useCallback((loc: Locale) => setLocale(loc), []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ── */}
      <header className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-surface-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-clinical-blue flex items-center justify-center">
              <span className="text-white font-heading font-bold text-base">Q</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-clinical-blue tracking-tight">
                DiaDent
              </span>
              <span className="font-heading text-lg font-semibold text-foreground tracking-tight">
                QLens
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              {l.features}
            </a>
            <a href="#case-study" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              {l.casestudy}
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-clinical-blue transition-colors">
              {l.howItWorks}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LandingControls onLocaleChange={handleLocale} />
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-surface-border text-muted-foreground hover:text-clinical-blue hover:border-clinical-blue hidden sm:inline-flex">
                {l.login}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-clinical-blue hover:brightness-110 text-white">
                {l.cta}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#005696]/[0.03] via-background to-background" />
        <div className="absolute top-16 right-0 w-[600px] h-[600px] bg-clinical-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-action/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-card/80 backdrop-blur px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-teal-action animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">{l.heroTag}</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              {l.heroTitle1}<br />
              <span className="text-clinical-blue">{l.heroTitle2}</span>{l.heroTitle3}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{l.heroDesc}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-clinical-blue hover:brightness-110 text-white text-base px-8 h-12 clinical-shadow">
                  {l.ctaFull}<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#case-study">
                <Button variant="outline" size="lg" className="border-surface-border text-muted-foreground hover:text-clinical-blue hover:border-clinical-blue text-base px-8 h-12">
                  {l.ctaCase}
                </Button>
              </a>
            </div>
            <div className="mt-14 flex flex-wrap items-center gap-6 text-muted-foreground">
              {[l.trust1, l.trust2, l.trust3].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-action" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="border-t border-surface-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Pain Points</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{l.painTitle}</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { icon: <BarChart3 className="h-6 w-6" />, title: l.pain1t, desc: l.pain1d },
              { icon: <Target className="h-6 w-6" />, title: l.pain2t, desc: l.pain2d },
              { icon: <FileCheck className="h-6 w-6" />, title: l.pain3t, desc: l.pain3d },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-card p-6 space-y-4 hover:clinical-shadow transition-all">
                <div className="w-12 h-12 rounded-xl bg-clinical-blue/10 text-clinical-blue flex items-center justify-center">{item.icon}</div>
                <h3 className="font-heading font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-surface-border scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{l.featTitle}</h2>
            <p className="mt-3 text-muted-foreground">{l.featSub}</p>
          </div>
          <div className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Upload className="h-5 w-5" />} color="bg-clinical-blue/10 text-clinical-blue" title={l.f1t} desc={l.f1d} />
            <Feature icon={<Target className="h-5 w-5" />} color="bg-teal-action/10 text-teal-action" title={l.f2t} desc={l.f2d} />
            <Feature icon={<TrendingUp className="h-5 w-5" />} color="bg-diagnostic-yellow/10 text-diagnostic-yellow" title={l.f3t} desc={l.f3d} />
            <Feature icon={<Shield className="h-5 w-5" />} color="bg-destructive/10 text-destructive" title={l.f4t} desc={l.f4d} />
            <Feature icon={<MessageSquare className="h-5 w-5" />} color="bg-clinical-blue/10 text-clinical-blue" title={l.f5t} desc={l.f5d} />
            <Feature icon={<FileCheck className="h-5 w-5" />} color="bg-teal-action/10 text-teal-action" title={l.f6t} desc={l.f6d} />
          </div>
        </div>
      </section>

      {/* ── Case Study ── */}
      <section id="case-study" className="border-t border-surface-border bg-secondary/30 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Case Study</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{l.caseTitle}</h2>
            <p className="mt-3 text-muted-foreground">{l.caseSub}</p>
          </div>

          {/* KPI */}
          <div className="mt-14 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "분석 사이즈", value: "5종", sub: "F1 · F2 · F3 · FX · FXL" },
              { label: "총 샘플", value: "289", sub: "33+68+68+60+60개" },
              { label: "측정 포인트", value: "7,514", sub: "26포인트 × 289샘플" },
              { label: "분석 소요", value: "< 3초", sub: "업로드부터 대시보드까지" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-card p-5 text-center hover:clinical-shadow transition-all">
                <p className="font-heading text-3xl font-bold text-clinical-blue">{kpi.value}</p>
                <p className="text-sm font-semibold mt-1">{kpi.label}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* 분석 테이블 */}
          <div className="mt-10 rounded-xl border border-surface-border bg-card overflow-hidden">
            <div className="border-b border-surface-border bg-card px-6 py-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-clinical-blue" />
              <h3 className="font-heading font-semibold text-sm">Confirm Fit GP #F1 — 포인트별 분석 (발췌)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-secondary/50">
                    <th className="px-6 py-3 text-left font-mono text-xs text-muted-foreground uppercase tracking-wider">포인트</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">평균 (mm)</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">σ</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">범위</th>
                    <th className="px-6 py-3 text-right font-mono text-xs text-muted-foreground uppercase tracking-wider">해석</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { point: "D0 (팁)", mean: "0.2286", std: "0.0169", range: "0.199~0.279", note: "산포 주의", color: "text-diagnostic-yellow" },
                    { point: "D12 (중간)", mean: "0.8852", std: "0.0148", range: "0.860~0.921", note: "안정적 공정", color: "text-teal-action" },
                    { point: "D24 (상단)", mean: "1.0865", std: "0.0344", range: "1.005~1.150", note: "관리 필요", color: "text-destructive" },
                    { point: "전장", mean: "29.320", std: "0.0950", range: "29.13~29.55", note: "관리한계 내 안정", color: "text-teal-action" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3 font-semibold">{row.point}</td>
                      <td className="px-6 py-3 font-mono text-right">{row.mean}</td>
                      <td className="px-6 py-3 font-mono text-right">{row.std}</td>
                      <td className="px-6 py-3 font-mono text-right text-muted-foreground">{row.range}</td>
                      <td className={`px-6 py-3 text-right text-xs font-mono font-bold uppercase ${row.color}`}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Chat Preview */}
          <div className="mt-10 rounded-xl border border-surface-border bg-card overflow-hidden">
            <div className="border-b border-surface-border px-6 py-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-clinical-blue" />
              <h3 className="font-heading font-semibold text-sm">AI 분석가 대화 예시</h3>
            </div>
            <div className="p-6 space-y-4 bg-secondary/20">
              <div className="flex justify-end">
                <div className="rounded-xl bg-clinical-blue text-white px-4 py-3 text-sm max-w-md">
                  팁 직경(D0)이 가장 불안정한 사이즈는?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-xl bg-card border border-surface-border px-5 py-4 text-sm max-w-lg leading-relaxed">
                  F1 사이즈의 D0(팁 직경)이 <strong className="text-clinical-blue">σ=0.0169mm</strong>로 상대적으로 가장 큰 변동을 보입니다.
                  CV(변동계수)는 7.39%로, 다른 사이즈(F2: 6.12%, F3: 4.89%)에 비해 높습니다.
                  <br /><br />
                  특히 샘플 #22의 D0=0.206mm와 샘플 #4의 D0=0.279mm 사이 범위가 넓어,
                  <strong className="text-clinical-blue"> 팁 성형 공정의 안정성 점검</strong>을 권장합니다.
                </div>
              </div>
            </div>
          </div>

          {/* Insight Cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Target className="h-5 w-5 text-diagnostic-yellow" />,
                title: "팁(D0) 산포 경고",
                desc: "F1 사이즈 D0의 변동계수가 7.39%로 가장 높음. 팁 성형 공정 점검 권장.",
                tag: "이상치 검출",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-clinical-blue" />,
                title: "상단부 테이퍼 편차",
                desc: "D22~D24 구간에서 σ가 0.03mm 이상으로 증가. 상단 절삭 균일성 확인 필요.",
                tag: "형상 분석",
              },
              {
                icon: <CheckCircle className="h-5 w-5 text-teal-action" />,
                title: "전장 안정성 확인",
                desc: "전 사이즈 전장 σ < 0.1mm, 관리한계(±3σ) 이내. 길이 공정은 안정 상태.",
                tag: "관리도",
              },
            ].map((insight, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-card p-5 space-y-3 hover:clinical-shadow transition-all">
                <div className="flex items-center justify-between">
                  {insight.icon}
                  <span className="font-mono text-[10px] font-bold text-clinical-blue bg-clinical-blue/10 px-2 py-1 rounded uppercase">
                    {insight.tag}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-sm">{insight.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-surface-border scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{l.stepsTitle}</h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3 relative">
            <div className="hidden sm:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-surface-border" />
            {[
              { step: "1", title: l.s1t, desc: l.s1d, icon: <Upload className="h-6 w-6" /> },
              { step: "2", title: l.s2t, desc: l.s2d, icon: <BarChart3 className="h-6 w-6" /> },
              { step: "3", title: l.s3t, desc: l.s3d, icon: <Zap className="h-6 w-6" /> },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4 relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-clinical-blue/10 text-clinical-blue relative z-10">{item.icon}</div>
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-clinical-blue text-white font-mono text-sm font-bold">{item.step}</div>
                <h3 className="font-heading font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="border-t border-surface-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-xs text-clinical-blue uppercase tracking-widest mb-3">Who It&apos;s For</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{l.forTitle}</h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {[l.for1, l.for2, l.for3, l.for4].map((text, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-surface-border bg-card p-5 hover:clinical-shadow transition-all">
                <div className="w-8 h-8 rounded-lg bg-teal-action/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-teal-action" />
                </div>
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-surface-border relative overflow-hidden">
        <div className="absolute inset-0 bg-clinical-blue" />
        <div className="absolute inset-0 bg-gradient-to-br from-clinical-blue via-clinical-blue to-[#003e6f]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-heading font-bold text-2xl">Q</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">{l.ctaBottom}</h2>
          <p className="mt-4 text-white/70 max-w-lg mx-auto">{l.ctaBottomSub}</p>
          <Link href="/login">
            <Button size="lg" className="mt-8 bg-white text-clinical-blue hover:bg-white/90 text-base px-8 h-12 font-semibold clinical-shadow">
              {l.ctaFull}<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-clinical-blue flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">Q</span>
              </div>
              <div>
                <span className="font-heading text-sm font-bold text-clinical-blue">DiaDent</span>
                <span className="font-heading text-sm font-semibold text-foreground ml-1">QLens</span>
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Diadent Group. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <h3 className="font-heading font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

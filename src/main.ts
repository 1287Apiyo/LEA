import { events as eventItems, navItems, programs as institutionProjects, scriptAction, stats, team, volunteers, type EventItem, type PageId, type Person, type Program } from "./data.js";
import { curriculumPrograms, type CurriculumProgram } from "./programs.js";

type Breakpoint = "mobile" | "desktop";
type StyleMap = Record<string, string | number>;
type AttrValue = string | number | boolean | null | undefined;
type Child = Node | string | number | boolean | null | undefined | Child[];

type ElementOptions = {
  attrs?: Record<string, AttrValue>;
  children?: Child[];
  onClick?: (event: MouseEvent) => void;
  style?: StyleMap;
  text?: string;
};

const theme = {
  purple: "#2c003e",
  plum: "#15001f",
  orange: "#f89d35",
  paper: "#fffdf8",
  white: "#ffffff",
  ink: "#211326",
  muted: "#69566f",
  line: "rgba(44, 0, 62, 0.14)",
  shadow: "0 18px 44px rgba(44, 0, 62, 0.11)",
};

let currentBreakpoint: Breakpoint = "desktop";
let menuOpen = false;
let resizeTimer = 0;

const breakpoint = (): Breakpoint => (window.innerWidth < 1060 ? "mobile" : "desktop");

const pageFromPath = (): PageId => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/about" || path === "/programs" || path === "/projects" || path === "/events" || path === "/volunteer" || path === "/contact") {
    return path.slice(1) as PageId;
  }
  return "home";
};

const cssName = (property: string): string => property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const applyStyle = <T extends HTMLElement>(element: T, rules: StyleMap = {}): T => {
  element.style.setProperty("box-sizing", "border-box");
  Object.entries(rules).forEach(([property, value]) => element.style.setProperty(cssName(property), String(value)));
  return element;
};

const setAttrs = (element: HTMLElement, attrs: Record<string, AttrValue> = {}): void => {
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (value === true) {
      element.setAttribute(name, "");
      return;
    }
    element.setAttribute(name, String(value));
  });
};

const appendChild = (parent: Node, child: Child): void => {
  if (Array.isArray(child)) {
    child.forEach((item) => appendChild(parent, item));
    return;
  }

  if (child === null || child === undefined || typeof child === "boolean") return;
  parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
};

const create = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  applyStyle(element, options.style);
  setAttrs(element, options.attrs);
  if (options.text !== undefined) element.textContent = options.text;
  if (options.onClick) element.addEventListener("click", (event) => options.onClick?.(event as MouseEvent));
  options.children?.forEach((child) => appendChild(element, child));
  children.forEach((child) => appendChild(element, child));
  return element;
};

const container = (...children: Child[]): HTMLElement =>
  create("div", {
    style: {
      width: "min(100% - 32px, 1180px)",
      marginInline: "auto",
    },
    children,
  });

const wideCardsContainer = (...children: Child[]): HTMLElement =>
  create("div", {
    style: {
      width: "min(100% - 32px, 1480px)",
      marginInline: "auto",
    },
    children,
  });

const stack = (gap: number, ...children: Child[]): HTMLElement =>
  create("div", { style: { display: "grid", gap: `${gap}px` }, children });

const interactive = <T extends HTMLElement>(element: T, normal: StyleMap, active: StyleMap): T => {
  applyStyle(element, normal);
  element.addEventListener("mouseenter", () => applyStyle(element, active));
  element.addEventListener("mouseleave", () => applyStyle(element, normal));
  element.addEventListener("focus", () => applyStyle(element, active));
  element.addEventListener("blur", () => applyStyle(element, normal));
  return element;
};

const navLink = (href: string, label: string, active: boolean): HTMLAnchorElement => {
  const normal: StyleMap = {
    minHeight: currentBreakpoint === "desktop" ? "44px" : "50px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: currentBreakpoint === "desktop" ? "center" : "flex-start",
    padding: currentBreakpoint === "desktop" ? "10px 14px" : "12px 0",
    borderBottom: currentBreakpoint === "desktop" ? "0" : `1px solid ${active ? theme.orange : theme.line}`,
    boxShadow: currentBreakpoint === "desktop" && active ? `inset 0 -2px 0 ${theme.orange}` : "none",
    color: active ? theme.purple : "#3a2b3e",
    fontWeight: active ? "700" : "400",
    fontSize: "1.02rem",
    lineHeight: "1",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  const hover: StyleMap = {
    ...normal,
    color: theme.purple,
    boxShadow: currentBreakpoint === "desktop" ? `inset 0 -2px 0 ${theme.orange}` : "none",
    borderBottom: currentBreakpoint === "desktop" ? "0" : `1px solid ${theme.orange}`,
  };

  return interactive(
    create("a", {
      attrs: { href, "aria-current": active ? "page" : undefined },
      text: label,
      onClick: () => {
        menuOpen = false;
      },
    }),
    normal,
    hover
  );
};

const donateButton = (): HTMLAnchorElement =>
  interactive(
    create("a", {
      attrs: { href: "/contact" },
      text: "Donate",
      style: {
        display: currentBreakpoint === "desktop" ? "inline-flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "42px",
        padding: "10px 22px",
        borderRadius: "3px",
        fontWeight: "700",
        lineHeight: "1",
        textDecoration: "none",
      },
    }),
    { background: theme.orange, border: `1px solid ${theme.orange}`, color: theme.plum },
    { background: theme.purple, border: `1px solid ${theme.purple}`, color: theme.white }
  );

const logo = (): HTMLAnchorElement =>
  create("a", {
    attrs: { href: "/", "aria-label": "LEA Organization home" },
    style: {
      display: "inline-flex",
      alignItems: "center",
      minWidth: currentBreakpoint === "desktop" ? "240px" : "0",
      color: theme.orange,
      textDecoration: "none",
    },
    children: [
      create("img", {
        attrs: { src: "/images/lea-logo-transparent.png", alt: "LEA Organization logo" },
        style: {
          display: "block",
          width: currentBreakpoint === "desktop" ? "210px" : "150px",
          height: currentBreakpoint === "desktop" ? "74px" : "54px",
          objectFit: "contain",
          border: "0",
          borderRadius: "0",
        },
      }),
    ],
  });

const menuButton = (): HTMLButtonElement => {
  const button = create("button", {
    attrs: { type: "button", "aria-label": menuOpen ? "Close menu" : "Open menu", "aria-expanded": String(menuOpen) },
    style: {
      display: currentBreakpoint === "desktop" ? "none" : "grid",
      placeItems: "center",
      width: "44px",
      height: "44px",
      border: `1px solid ${theme.line}`,
      borderRadius: "4px",
      background: theme.white,
      color: theme.orange,
      cursor: "pointer",
    },
    onClick: () => {
      menuOpen = !menuOpen;
      render();
    },
  });

  button.appendChild(
    stack(
      5,
      create("span", { style: { display: "block", width: "20px", height: "2px", background: theme.purple } }),
      create("span", { style: { display: "block", width: "20px", height: "2px", background: theme.purple } })
    )
  );

  return button;
};

const navigation = (activePage: PageId): HTMLElement =>
  create("nav", {
    attrs: { "aria-label": "Main navigation" },
    style:
      currentBreakpoint === "desktop"
        ? {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
          }
        : {
            position: "fixed",
            top: "72px",
            left: "0",
            right: "0",
            zIndex: "999",
            display: menuOpen ? "grid" : "none",
            padding: "14px 24px 26px",
            background: theme.paper,
            borderBottom: `1px solid ${theme.line}`,
            boxShadow: theme.shadow,
          },
    children: navItems.map((item) => navLink(item.href, item.label, item.id === activePage)),
  });

const header = (activePage: PageId): HTMLElement =>
  create("header", {
    style: {
      position: "sticky",
      top: "0",
      zIndex: "1000",
      background: "rgba(255, 253, 248, 0.98)",
      borderBottom: `1px solid ${theme.line}`,
      boxShadow: "0 8px 30px rgba(44, 0, 62, 0.05)",
      backdropFilter: "blur(12px)",
    },
    children: [
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          height: "4px",
          background: `linear-gradient(90deg, ${theme.orange}, ${theme.purple})`,
        },
      }),
      container(
        create("div", {
          style: {
            minHeight: currentBreakpoint === "desktop" ? "82px" : "68px",
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "auto minmax(0, 1fr) auto" : "minmax(0, 1fr) auto",
            gap: currentBreakpoint === "desktop" ? "30px" : "12px",
            alignItems: "center",
          },
          children: [logo(), navigation(activePage), donateButton(), menuButton()],
        })
      ),
    ],
  });

const emptyPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "Page content" },
    style: {
      minHeight: currentBreakpoint === "desktop" ? "calc(100vh - 86px)" : "calc(100vh - 72px)",
      background: theme.white,
    },
  });

const section = (background: string, padding: string, ...children: Child[]): HTMLElement =>
  create("section", { style: { background, padding }, children });

const heading = (text: string, level: 1 | 2 | 3, extra: StyleMap = {}): HTMLElement => {
  const size =
    level === 1
      ? currentBreakpoint === "desktop"
        ? "3.15rem"
        : "2.35rem"
      : level === 2
        ? currentBreakpoint === "desktop"
          ? "2.15rem"
          : "1.85rem"
        : "1.22rem";

  return create(`h${level}` as keyof HTMLElementTagNameMap, {
    text,
    style: {
      margin: "0",
      color: theme.ink,
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: size,
      fontWeight: "700",
      lineHeight: "1.05",
      letterSpacing: "0",
      ...extra,
    },
  });
};

const copy = (text: string, extra: StyleMap = {}): HTMLParagraphElement =>
  create("p", {
    text,
    style: {
      margin: "0",
      color: theme.muted,
      fontSize: currentBreakpoint === "desktop" ? "1.08rem" : "1rem",
      lineHeight: "1.62",
      ...extra,
    },
  });

const eyebrow = (text: string, extra: StyleMap = {}): HTMLElement =>
  create("span", {
    text,
    style: {
      display: "inline-block",
      color: theme.purple,
      fontSize: "0.78rem",
      fontWeight: "700",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      ...extra,
    },
  });

const image = (src: string, alt: string, extra: StyleMap = {}): HTMLImageElement =>
  create("img", {
    attrs: { src, alt, loading: "lazy" },
    style: {
      display: "block",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      ...extra,
    },
  });

const actionButton = (href: string, text: string, variant: "orange" | "outline" | "purple" = "orange"): HTMLAnchorElement => {
  const link = create("a", {
    attrs: { href },
    text,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "46px",
      padding: "12px 20px",
      borderRadius: "3px",
      fontWeight: "700",
      lineHeight: "1",
      textDecoration: "none",
    },
  });

  if (variant === "outline") {
    return interactive(
      link,
      { color: theme.white, background: "transparent", border: "1px solid rgba(255,255,255,0.55)" },
      { color: theme.purple, background: theme.white, border: `1px solid ${theme.white}` }
    );
  }

  if (variant === "purple") {
    return interactive(
      link,
      { color: theme.white, background: theme.purple, border: `1px solid ${theme.purple}` },
      { color: theme.plum, background: theme.orange, border: `1px solid ${theme.orange}` }
    );
  }

  return interactive(
    link,
    { color: theme.plum, background: theme.orange, border: `1px solid ${theme.orange}` },
    { color: theme.white, background: theme.purple, border: `1px solid ${theme.purple}` }
  );
};

const sectionTitle = (label: string, title: string, text?: string): HTMLElement =>
  stack(
    10,
    eyebrow(label, { textAlign: "center" }),
    heading(title, 2, { textAlign: "center" }),
    text ? copy(text, { maxWidth: "650px", marginInline: "auto", textAlign: "center" }) : null
  );

const cardStyle = (extra: StyleMap = {}): StyleMap => ({
  overflow: "hidden",
  border: `1px solid ${theme.line}`,
  borderRadius: "7px",
  background: theme.white,
  boxShadow: "0 18px 40px rgba(44, 0, 62, 0.08)",
  ...extra,
});

const landingHero = (): HTMLElement =>
  section(
    theme.plum,
    "0",
    create("section", {
      style: {
        position: "relative",
        width: "100%",
        minHeight: currentBreakpoint === "desktop" ? "calc(100vh - 86px)" : "620px",
        display: "grid",
        alignItems: "center",
        overflow: "hidden",
        background: theme.plum,
      },
      children: [
        image("images/Happy.jpeg", "LEA learners smiling during a learning day", {
          position: "absolute",
          inset: "0",
          zIndex: "0",
          opacity: "0.56",
          objectPosition: "center",
          transform: "scale(1.02)",
          filter: "brightness(0.62) contrast(1.08)",
        }),
        create("div", {
          attrs: { "aria-hidden": "true" },
          style: {
            position: "absolute",
            inset: "0",
            zIndex: "1",
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(8,0,13,0.84) 35%, rgba(21,0,31,0.62) 70%, rgba(0,0,0,0.46) 100%)",
          },
        }),
        create("div", {
          style: {
            position: "relative",
            zIndex: "2",
            width: "min(100% - 32px, 1180px)",
            marginInline: "auto",
          },
          children: [
            stack(
              20,
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: currentBreakpoint === "desktop" ? "610px" : "430px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 3px 18px rgba(0,0,0,0.6)",
                },
                children: [
                  "Empowering ",
                  create("span", { text: "Future", style: { color: theme.orange } }),
                  " Engineers",
                ],
              }),
              copy("We bridge the gap between curiosity and career-ready technical skills through intensive, hands-on coding education for the next generation.", {
                color: theme.white,
                maxWidth: currentBreakpoint === "desktop" ? "600px" : "390px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.45)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("/programs", "Explore Programs", "orange"), actionButton("/volunteer", "Join Our Mission", "outline")],
              })
            ),
          ],
        }),
      ],
    })
  );

const missionCardsSection = (): HTMLElement => {
  const storyStats = [
    [2, "Years of Experience"],
    [35, "Active Volunteers"],
    [47, "Available Counties"],
    [200, "Young Coders Trained"],
  ] as const;

  return create(
    "section",
    {
      style: {
        position: "relative",
        zIndex: "4",
        background: theme.white,
        padding: currentBreakpoint === "desktop" ? "0 0 46px" : "24px 0 46px",
        overflow: "visible",
      },
    },
    wideCardsContainer(
      stack(
        currentBreakpoint === "desktop" ? 34 : 28,
        create("div", {
          style: {
            position: "relative",
            zIndex: "12",
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "0.72fr 1.28fr" : "1fr",
            gap: currentBreakpoint === "desktop" ? "0" : "24px",
            alignItems: "stretch",
            minHeight: currentBreakpoint === "desktop" ? "430px" : "auto",
          },
          children: [
            storyGlobe(),
            storyTextPanel(),
          ],
        }),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
            gap: currentBreakpoint === "desktop" ? "0" : "18px",
            borderTop: `1px solid ${theme.line}`,
          },
          children: storyStats.map(([value, label], index) => storyStat(value, label, index)),
        })
      )
    )
  );
};

const storyTextPanel = (): HTMLElement =>
  create("div", {
    style: {
      padding: currentBreakpoint === "desktop" ? "36px max(64px, calc((100vw - 1180px) / 2 + 64px)) 36px 48px" : "26px",
      marginRight: currentBreakpoint === "desktop" ? "calc(max(16px, calc((100vw - 1180px) / 2 + 16px)) * -1)" : "0",
      background: theme.purple,
      color: theme.white,
      minHeight: currentBreakpoint === "desktop" ? "430px" : "auto",
      display: "grid",
      alignContent: "center",
      boxShadow: "none",
    },
    children: [
      stack(
        14,
        eyebrow("Our Story", { color: theme.orange }),
        heading("We Prepare Them For A Future In Technology", 2, {
          color: theme.white,
          maxWidth: "940px",
          fontSize: currentBreakpoint === "desktop" ? "2.2rem" : "1.82rem",
        }),
        copy("LEA Organization was built on a simple belief: young learners should not have to wait for opportunity to find them. We bring practical coding, mentorship, and digital confidence into communities where access can change the direction of a life.", {
          maxWidth: "940px",
          color: "#f4e8f7",
          fontWeight: "700",
        }),
        copy("Through volunteers, schools, rescue centres, community partners, and hands-on learning days, we help learners move from curiosity to real projects they can understand, explain, and keep building.", {
          maxWidth: "940px",
          color: "#eadbed",
        }),
        create("a", {
          attrs: { href: "/about" },
          text: "OUR STORY",
          style: {
            display: "inline-flex",
            width: "fit-content",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50px",
            padding: "14px 34px",
            marginTop: "10px",
            background: theme.orange,
            color: theme.plum,
            fontWeight: "700",
            letterSpacing: "0.06em",
            textDecoration: "none",
          },
        }),
      ),
    ],
  });

const storyGlobe = (): HTMLElement => {
  const projects = [
    ["Mogra Rescue Center", "40%", "35%"],
    ["Mukuru Slums Development Project", "39%", "60%"],
    ["Highway Secondary School", "59%", "47%"],
  ] as const;

  const globeFace = image("images/globe-real-clean.png", "Purple dotted global project map", {
    position: "absolute",
    inset: "0",
    zIndex: "3",
    objectFit: "contain",
    objectPosition: "center top",
    opacity: "1",
    filter: "hue-rotate(135deg) saturate(1.35) drop-shadow(0 28px 24px rgba(44,0,62,0.16))",
    transformOrigin: "50% 50%",
  });

  const globe = create("div", {
    style: {
      position: "relative",
      zIndex: "6",
      width: currentBreakpoint === "desktop" ? "850px" : "min(110vw, 510px)",
      height: currentBreakpoint === "desktop" ? "680px" : "408px",
      marginInline: currentBreakpoint === "desktop" ? "-154px auto" : "auto",
    },
    children: [
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          left: "19%",
          right: "19%",
          bottom: currentBreakpoint === "desktop" ? "42px" : "34px",
          zIndex: "1",
          height: currentBreakpoint === "desktop" ? "48px" : "34px",
          borderRadius: "999px",
          background: "radial-gradient(ellipse, rgba(44,0,62,0.16) 0%, rgba(44,0,62,0.08) 42%, rgba(44,0,62,0) 72%)",
          filter: "blur(8px)",
        },
      }),
      globeFace,
      ...projects.map(([name, left, top], index) =>
        storyProjectMarker(name, left, top, index)
      ),
    ],
  });

  window.requestAnimationFrame(() => {
    globeFace.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: "translateY(-8px) rotate(180deg)" },
        { transform: "translateY(0) rotate(360deg)" },
      ],
      {
        duration: 36000,
        iterations: Infinity,
        easing: "linear",
      }
    );
  });

  return create("div", {
    style: {
      position: "relative",
      zIndex: "16",
      minHeight: currentBreakpoint === "desktop" ? "520px" : "430px",
      display: "grid",
      alignItems: "start",
      justifyItems: currentBreakpoint === "desktop" ? "start" : "center",
      marginTop: currentBreakpoint === "desktop" ? "-72px" : "14px",
      overflow: "visible",
    },
    children: [globe],
  });
};

const storyProjectMarker = (name: string, left: string, top: string, index: number): HTMLElement => {
  const label = create("span", {
    text: name,
    style: {
      position: "absolute",
      left: "50%",
      bottom: "calc(100% + 12px)",
      transform: "translateX(-50%) translateY(0)",
      width: "max-content",
      minWidth: currentBreakpoint === "desktop" ? "220px" : "190px",
      maxWidth: currentBreakpoint === "desktop" ? "320px" : "280px",
      padding: "11px 18px",
      background: theme.orange,
      color: theme.plum,
      boxShadow: "0 14px 32px rgba(248,157,53,0.28)",
      fontSize: currentBreakpoint === "desktop" ? "0.92rem" : "0.8rem",
      fontWeight: "700",
      textAlign: "center",
      whiteSpace: "nowrap",
      opacity: "1",
      pointerEvents: "none",
      transition: "opacity 180ms ease, transform 180ms ease",
    },
  });

  return create("button", {
    attrs: { type: "button", "aria-label": `Show ${name}` },
    onClick: () => {
      const visible = label.style.opacity === "1";
      applyStyle(label, {
        opacity: visible ? "0.68" : "1",
        transform: visible ? "translateX(-50%) translateY(4px)" : "translateX(-50%) translateY(0)",
      });
    },
    style: {
      position: "absolute",
      left,
      top,
      zIndex: "5",
      width: index === 0 ? "18px" : "15px",
      height: index === 0 ? "18px" : "15px",
      padding: "0",
      border: "0",
      borderRadius: "999px",
      background: theme.purple,
      boxShadow: "0 0 0 7px rgba(44,0,62,0.11), 0 6px 16px rgba(44,0,62,0.22)",
      cursor: "pointer",
    },
    children: [
      label,
      create("span", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "-6px",
          border: "1px solid rgba(44,0,62,0.28)",
          borderRadius: "inherit",
        },
      }),
    ],
  });
};

const storyStat = (target: number, label: string, index: number): HTMLElement => {
  const value = create("strong", {
    text: "0",
    style: {
      display: "block",
      color: theme.orange,
      fontSize: currentBreakpoint === "desktop" ? "2.7rem" : "2.1rem",
      lineHeight: "1",
      fontWeight: "700",
      marginBottom: "14px",
    },
  });

  window.requestAnimationFrame(() => {
    const start = performance.now();
    const duration = 1600 + index * 180;
    const tick = (time: number): void => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      value.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });

  return create("article", {
    style: {
      padding: currentBreakpoint === "desktop" ? "30px 32px 0" : "22px 0 0",
      borderLeft: currentBreakpoint === "desktop" && index > 0 ? `1px solid ${theme.line}` : "0",
    },
    children: [
      value,
      create("span", {
        text: label,
        style: {
          display: "block",
          color: "#000000",
          fontSize: "1rem",
          fontWeight: "700",
          lineHeight: "1.25",
        },
      }),
    ],
  });
};

const transformationSection = (): HTMLElement =>
  create(
    "section",
    {
      style: {
        position: "relative",
        overflow: "hidden",
        padding: currentBreakpoint === "desktop" ? "76px 0 92px" : "58px 0 66px",
        background:
          currentBreakpoint === "desktop"
            ? `linear-gradient(90deg, #050505 0 60%, ${theme.purple} 60% 100%)`
            : `linear-gradient(180deg, #050505 0 48%, ${theme.purple} 48% 100%)`,
      },
    },
    container(
      stack(
        currentBreakpoint === "desktop" ? 28 : 22,
        heading("We Prepare Them For A Future In Technology", 2, {
          color: theme.orange,
          maxWidth: currentBreakpoint === "desktop" ? "760px" : "100%",
          fontSize: currentBreakpoint === "desktop" ? "3rem" : "2.1rem",
          textTransform: "uppercase",
          lineHeight: "1.18",
        }),
        create("div", {
          style: {
            width: currentBreakpoint === "desktop" ? "min(100%, 1120px)" : "100%",
            marginLeft: currentBreakpoint === "desktop" ? "0" : "0",
            transform: currentBreakpoint === "desktop" ? "translateX(24px)" : "none",
          },
          children: [lazyVideoPlayer()],
        })
      )
    )
  );

const lazyVideoPlayer = (): HTMLElement => {
  const frame = create("figure", {
    style: {
      position: "relative",
      overflow: "hidden",
      margin: "0",
      aspectRatio: "16 / 9",
      background: "#050505",
      boxShadow: "0 32px 80px rgba(0,0,0,0.38)",
    },
    children: [
      image("images/video-poster.jpg", "LEA team celebrating together outdoors", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectFit: "cover",
        objectPosition: "center",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(180deg, rgba(0,0,0,0.58), rgba(0,0,0,0.72))",
        },
      }),
      create("button", {
        attrs: { type: "button", "aria-label": "Play LEA video" },
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          zIndex: "2",
          width: currentBreakpoint === "desktop" ? "78px" : "64px",
          height: currentBreakpoint === "desktop" ? "78px" : "64px",
          display: "grid",
          placeItems: "center",
          padding: "0",
          transform: "translate(-50%, -50%)",
          border: `3px solid ${theme.orange}`,
          borderRadius: "999px",
          background: "#050505",
          color: theme.orange,
          cursor: "pointer",
          boxShadow: "0 18px 46px rgba(0,0,0,0.32)",
        },
        onClick: () => {
          const video = create("video", {
            attrs: { controls: true, autoplay: true, preload: "metadata", playsinline: true, poster: "images/video-poster.jpg" },
            style: {
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#050505",
            },
            children: [create("source", { attrs: { src: "images/Intro (1).mp4", type: "video/mp4" } })],
          });
          frame.replaceChildren(video);
          video.play().catch(() => undefined);
        },
        children: [
          create("span", {
            attrs: { "aria-hidden": "true" },
            style: {
              display: "block",
              width: "0",
              height: "0",
              marginLeft: "5px",
              borderTop: currentBreakpoint === "desktop" ? "14px solid transparent" : "11px solid transparent",
              borderBottom: currentBreakpoint === "desktop" ? "14px solid transparent" : "11px solid transparent",
              borderLeft: currentBreakpoint === "desktop" ? `22px solid ${theme.orange}` : `18px solid ${theme.orange}`,
            },
          }),
        ],
      }),
      create("div", {
        style: {
          position: "absolute",
          left: currentBreakpoint === "desktop" ? "24px" : "14px",
          right: currentBreakpoint === "desktop" ? "24px" : "14px",
          bottom: currentBreakpoint === "desktop" ? "18px" : "12px",
          zIndex: "2",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: theme.white,
          fontWeight: "700",
        },
        children: [
          create("span", {
            style: { flex: "1", height: "3px", background: "rgba(255,255,255,0.5)" },
          }),
        ],
      }),
    ],
  });

  return frame;
};

const programsPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "Our programs content" },
    style: { background: theme.paper },
    children: [programsHero(), programsOverviewSection(), programsPathwaySection(), programsFlowSection(), landingFooter()],
  });

const programsHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "560px" : "520px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/LEA pics/coding3.jpg", "LEA learners coding during a program session", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectPosition: "center 42%",
        filter: "brightness(0.48) contrast(1.1) saturate(1.02)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(21,0,31,0.82) 46%, rgba(0,0,0,0.44) 100%)",
        },
      }),
      container(
        create("div", {
          style: { position: "relative", zIndex: "2", maxWidth: currentBreakpoint === "desktop" ? "780px" : "100%" },
          children: [
            stack(
              18,
              eyebrow("Programs / Curriculum", { color: theme.orange }),
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: "760px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 4px 22px rgba(0,0,0,0.52)",
                },
                children: ["Four pathways for ", create("span", { text: "young builders", style: { color: theme.orange } }), "."],
              }),
              copy("Learners move from playful coding foundations to websites, app prototypes, and team build challenges that help them explain what they create.", {
                color: theme.white,
                maxWidth: "700px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("#program-pathways", "View Programs"), actionButton("/contact", "Bring This To Your School", "outline")],
              })
            ),
          ],
        })
      ),
    ],
  });

const programsOverviewSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 92px" : "62px 0 70px",
    container(
      create("div", {
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "0.9fr 1.1fr" : "1fr",
          gap: currentBreakpoint === "desktop" ? "46px" : "28px",
          alignItems: "center",
        },
        children: [
          stack(
            14,
            eyebrow("Learning Pathway", { color: theme.orange }),
            heading("Short, practical programs with a clear build outcome.", 2, {
              fontSize: currentBreakpoint === "desktop" ? "2.75rem" : "2rem",
            }),
            copy("Each program is designed to be approachable for beginners, useful for returning learners, and practical enough for schools, community centres, and volunteer-led learning days."),
            copy("The goal is simple: every learner should leave with something they understand, can present, and can keep improving."),
          ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(2, minmax(0, 1fr))" : "1fr",
            gap: "16px",
          },
          children: curriculumPrograms.map((program) => programSnapshotCard(program)),
        }),
        ],
      })
    )
  );

const programSnapshotCard = (program: CurriculumProgram): HTMLElement =>
  create("a", {
    attrs: { href: `#${programSlug(program.title)}` },
    style: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gap: "14px",
      alignItems: "center",
      padding: "20px",
      background: theme.paper,
      border: `1px solid ${theme.line}`,
      borderLeft: `5px solid ${theme.orange}`,
      color: theme.ink,
      textDecoration: "none",
      boxShadow: "0 14px 32px rgba(44,0,62,0.07)",
    },
    children: [
      create("span", {
        text: program.number,
        style: {
          width: "48px",
          height: "48px",
          display: "inline-grid",
          placeItems: "center",
          background: theme.purple,
          color: theme.white,
          fontWeight: "700",
        },
      }),
      stack(
        4,
        heading(program.title, 3, { color: theme.purple, fontSize: "1.2rem" }),
        copy(program.label, { color: theme.muted, fontSize: "0.95rem", lineHeight: "1.35" })
      ),
    ],
  });

const programsPathwaySection = (): HTMLElement =>
  section(
    theme.purple,
    currentBreakpoint === "desktop" ? "88px 0 96px" : "62px 0 70px",
    container(
      stack(
        34,
        stack(
          10,
          eyebrow("LEA Organization: Our Programs", { color: theme.orange }),
          heading("Four programs, one clear path.", 2, {
            color: theme.white,
            fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem",
          }),
          copy("Short, focused pathways for school visits, community sessions, clubs, and focused build days.", {
            color: "#eadbed",
            maxWidth: "760px",
          })
        ),
        create("div", {
          attrs: { id: "program-pathways" },
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
            gap: currentBreakpoint === "desktop" ? "24px" : "20px",
          },
          children: curriculumPrograms.map((program, index) => programCard(program, index)),
        })
      )
    )
  );

const programCard = (program: CurriculumProgram, index: number): HTMLElement =>
  create("article", {
    attrs: { id: programSlug(program.title) },
    style: {
      display: "grid",
      gridTemplateRows: currentBreakpoint === "desktop" ? "220px minmax(0, 1fr)" : "230px auto",
      minHeight: currentBreakpoint === "desktop" ? "430px" : "auto",
      overflow: "hidden",
      background: theme.white,
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
    },
    children: [
      create("div", {
        style: { overflow: "hidden", background: theme.plum },
        children: [
          image(program.image, program.alt, {
            objectPosition: index === 2 ? "center 36%" : index === 3 ? "center 35%" : "center",
            filter: "saturate(1.04) contrast(1.04)",
          }),
        ],
      }),
      create("div", {
        style: {
          display: "grid",
          gridTemplateRows: "auto auto minmax(0, 1fr)",
          alignContent: "start",
          gap: "12px",
          padding: currentBreakpoint === "desktop" ? "28px" : "24px",
        },
        children: [
          heading(program.title, 3, { color: theme.purple, fontSize: currentBreakpoint === "desktop" ? "1.62rem" : "1.4rem" }),
          eyebrow(program.label, { color: theme.orange }),
          copy(program.text, { color: theme.muted, fontSize: "1rem", lineHeight: "1.6" }),
        ],
      }),
    ],
  });

const programsFlowSection = (): HTMLElement => {
  const steps = [
    ["Start With Access", "We meet learners where they are, set up the tools, and begin with approachable activities."],
    ["Build In Sessions", "Learners practice by making small projects, improving them, and asking better questions."],
    ["Share The Work", "Each pathway ends with demos, feedback, and next steps learners can keep building from."],
  ] as const;

  return section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 94px" : "62px 0 70px",
    container(
      create("div", {
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "0.95fr 1.05fr" : "1fr",
          gap: currentBreakpoint === "desktop" ? "44px" : "28px",
          alignItems: "stretch",
        },
        children: [
          aboutImagePanel("images/LEA pics/coding3.jpg", "LEA learners coding together during a practical session", "Practical sessions", "brightness(0.48) contrast(1.12) saturate(1.04)"),
          stack(
            22,
            stack(
              12,
              eyebrow("How It Works", { color: theme.orange }),
              heading("A rhythm learners can follow.", 2, {
                fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem",
              }),
              copy("The curriculum works best when learners get a little guidance, a real build task, and space to explain their thinking."),
            ),
            create("div", {
              style: { display: "grid", gap: "14px" },
              children: steps.map(([title, text], index) => programFlowCard(title, text, index)),
            })
          ),
        ],
      })
    )
  );
};

const programFlowCard = (title: string, text: string, index: number): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gap: "16px",
      alignItems: "start",
      padding: "22px",
      background: theme.paper,
      border: `1px solid ${theme.line}`,
    },
    children: [
      create("span", {
        text: String(index + 1).padStart(2, "0"),
        style: {
          width: "46px",
          height: "46px",
          display: "inline-grid",
          placeItems: "center",
          background: theme.purple,
          color: theme.white,
          fontWeight: "700",
        },
      }),
      stack(6, heading(title, 3, { color: theme.purple, fontSize: "1.22rem" }), copy(text, { fontSize: "0.98rem", lineHeight: "1.52" })),
    ],
  });

const programsCtaSection = (): HTMLElement =>
  section(
    "#050505",
    currentBreakpoint === "desktop" ? "76px 0 82px" : "58px 0 64px",
    container(
      create("div", {
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "1fr auto" : "1fr",
          gap: currentBreakpoint === "desktop" ? "34px" : "22px",
          alignItems: "center",
        },
        children: [
          stack(
            14,
            eyebrow("Bring LEA To Your Learners", { color: theme.orange }),
            heading("Let us shape the right program day with you.", 2, {
              color: theme.white,
              fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem",
            }),
            copy("Tell us the learners' ages, available time, and access to devices. We will help choose the best starting point.", {
              color: "#d8d0dc",
              maxWidth: "720px",
            })
          ),
          create("div", {
            style: { display: "flex", flexWrap: "wrap", gap: "12px" },
            children: [actionButton("/contact", "Contact LEA"), actionButton("/volunteer", "Volunteer With Programs", "outline")],
          }),
        ],
      })
    )
  );

const programSlug = (title: string): string => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type ProjectProfile = {
  focus: string;
  learners: string;
  image: string;
  summary: string;
  status: string;
};

const projectProfile = (project: Program): ProjectProfile => {
  const profiles: Record<string, ProjectProfile> = {
    "Mogra Children's Rescue Centre": {
      focus: "Scratch Programming",
      learners: "Younger learners",
      image: "images/M1.jpeg",
      summary: "At Mogra, LEA introduces children to Scratch through games, stories, animation, and playful logic. The goal is confidence first: learners see that code can be something they can touch, change, and explain.",
      status: "Active Scratch sessions",
    },
    "Mukuru Slums Development Project": {
      focus: "Web Development",
      learners: "Community learners",
      image: "images/LEA pics/coding3.jpg",
      summary: "At MSDP, LEA runs web development pathways that help learners understand HTML, CSS, JavaScript, page structure, and presentation. The program has already grown into two web development graduation moments.",
      status: "Two web graduations",
    },
    "Highway Senior School": {
      focus: "Web Development",
      learners: "Secondary school learners",
      image: "images/LEA - HIGHWAY-1.jpg",
      summary: "At Highway, LEA supports students with practical web learning: building pages, thinking through structure, and using technology as a serious academic and career pathway.",
      status: "School web program",
    },
  };

  return profiles[project.title];
};

const orderedInstitutionProjects = (): Program[] => {
  const order = ["Mogra Children's Rescue Centre", "Mukuru Slums Development Project", "Highway Senior School"];
  return order.map((title) => institutionProjects.find((project) => project.title === title)).filter((project): project is Program => Boolean(project));
};

const projectsPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "LEA projects content" },
    style: { background: theme.paper },
    children: [projectsHero(), projectsInstitutionsSection(), projectsGraduationSection(), projectsPartnersSection(), landingFooter()],
  });

const projectsHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "560px" : "520px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/LEA pics/coding3.jpg", "LEA learners coding inside an institution program", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectPosition: "center 42%",
        filter: "brightness(0.42) contrast(1.12) saturate(1.02)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(21,0,31,0.86) 48%, rgba(0,0,0,0.42) 100%)",
        },
      }),
      container(
        create("div", {
          style: { position: "relative", zIndex: "2", maxWidth: currentBreakpoint === "desktop" ? "800px" : "100%" },
          children: [
            stack(
              18,
              eyebrow("Projects / Institutions", { color: theme.orange }),
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: "780px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 4px 22px rgba(0,0,0,0.52)",
                },
                children: ["Where LEA ", create("span", { text: "teaches", style: { color: theme.orange } }), "."],
              }),
              copy("Our projects are the institutions and community spaces where LEA brings practical coding education: Mogra, MSDP, and Highway.", {
                color: theme.white,
                maxWidth: "720px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("#project-institutions", "View Institutions"), actionButton("/programs", "See Curriculum", "outline")],
              })
            ),
          ],
        })
      ),
    ],
  });

const projectsInstitutionsSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "88px 0 96px" : "62px 0 70px",
    wideCardsContainer(
      stack(
        34,
        stack(
          10,
          eyebrow("Institution Projects", { color: theme.orange }),
          heading("Three learning homes, one technology mission.", 2, {
            maxWidth: "840px",
            fontSize: currentBreakpoint === "desktop" ? "2.7rem" : "2rem",
          }),
          copy("Each project is shaped around the learners in that space: Scratch for younger children, web development for community and school learners, and milestones that show progress.", {
            maxWidth: "860px",
          })
        ),
        create("div", {
          attrs: { id: "project-institutions" },
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(3, minmax(0, 1fr))" : "1fr",
            gap: currentBreakpoint === "desktop" ? "22px" : "20px",
          },
          children: orderedInstitutionProjects().map((project) => projectInstitutionCard(project)),
        })
      )
    )
  );

const projectInstitutionCard = (project: Program): HTMLElement => {
  const profile = projectProfile(project);

  return create("article", {
    style: {
      display: "grid",
      gridTemplateRows: currentBreakpoint === "desktop" ? "260px minmax(0, 1fr)" : "240px auto",
      overflow: "hidden",
      background: theme.purple,
      border: `1px solid ${theme.purple}`,
      boxShadow: "0 18px 40px rgba(44, 0, 62, 0.16)",
    },
    children: [
      create("div", {
        style: { position: "relative", overflow: "hidden", background: theme.plum },
        children: [
          image(profile.image, project.alt, {
            objectPosition: project.title.includes("Highway") ? "center 42%" : "center",
            filter: "blur(1.2px) brightness(0.66) contrast(1.08) saturate(1.04)",
            transform: "scale(1.03)",
          }),
          create("span", {
            text: profile.status,
            style: {
              position: "absolute",
              left: "18px",
              bottom: "18px",
              padding: "9px 12px",
              background: theme.white,
              color: theme.purple,
              fontSize: "0.78rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              border: `1px solid ${theme.white}`,
              boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
            },
          }),
        ],
      }),
      create("div", {
        style: { display: "grid", alignContent: "start", gap: "12px", padding: currentBreakpoint === "desktop" ? "26px" : "22px" },
        children: [
          eyebrow(project.label, { color: theme.orange }),
          heading(project.title, 3, { color: theme.orange, fontSize: currentBreakpoint === "desktop" ? "1.52rem" : "1.36rem" }),
          create("div", {
            style: { display: "flex", flexWrap: "wrap", gap: "8px" },
            children: [
              projectTag(profile.focus),
              projectTag(profile.learners),
            ],
          }),
          copy(profile.summary, { color: "#f4e8f7", fontSize: "0.98rem", lineHeight: "1.58" }),
        ],
      }),
    ],
  });
};

const projectTag = (text: string): HTMLElement =>
  create("span", {
    text,
    style: {
      display: "inline-flex",
      alignItems: "center",
      minHeight: "30px",
      padding: "7px 10px",
      background: theme.white,
      color: theme.purple,
      fontSize: "0.82rem",
      fontWeight: "700",
    },
  });

const projectsGraduationSection = (): HTMLElement =>
  section(
    theme.purple,
    currentBreakpoint === "desktop" ? "86px 0 96px" : "62px 0 70px",
    container(
      create("div", {
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "0.82fr 1.18fr" : "1fr",
          gap: currentBreakpoint === "desktop" ? "44px" : "28px",
          alignItems: "start",
        },
        children: [
          stack(
            14,
            eyebrow("MSDP Milestones", { color: theme.orange }),
            heading("Two web development graduations at MSDP.", 2, {
              color: theme.white,
              fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem",
            }),
            copy("Mukuru Slums Development Project is one of LEA's clearest examples of pathway learning: learners move through web development sessions, then celebrate progress through graduation moments.", {
              color: "#eadbed",
              maxWidth: "620px",
            })
          ),
          create("div", {
            style: {
              display: "grid",
              gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(2, minmax(0, 1fr))" : "1fr",
              gap: "18px",
            },
            children: [
              graduationCard("1st Web Development Graduation", "MSDP learners celebrated completing a practical web development pathway and presenting their progress.", "images/grad.jpeg", "MSDP web development graduation moment", "Web Development"),
              graduationCard("2nd Cohort MSDP Graduation", "A second cohort graduation marked learner commitment, stronger confidence, and continued growth in web skills.", "images/november.png", "Second cohort MSDP graduation moment", "Web Development"),
            ],
          }),
        ],
      })
    )
  );

const graduationCard = (title: string, text: string, src: string, alt: string, label: string): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      gridTemplateRows: currentBreakpoint === "desktop" ? "230px minmax(0, 1fr)" : "230px auto",
      overflow: "hidden",
      background: theme.white,
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
    },
    children: [
      create("div", {
        style: { overflow: "hidden", background: theme.plum },
        children: [image(src, alt, { objectPosition: "center", filter: "saturate(1.04) contrast(1.04)" })],
      }),
      create("div", {
        style: { display: "grid", alignContent: "start", gap: "10px", padding: "24px" },
        children: [
          eyebrow(label, { color: theme.orange }),
          heading(title, 3, { color: theme.purple, fontSize: "1.34rem" }),
          copy(text, { color: theme.muted, fontSize: "0.98rem", lineHeight: "1.55" }),
        ],
      }),
    ],
  });

const projectsPartnersSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "84px 0 92px" : "58px 0 66px",
    container(
      stack(
        30,
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "minmax(0, 1fr) auto" : "1fr",
            gap: "22px",
            alignItems: "end",
          },
          children: [
            stack(
              12,
              eyebrow("Our Partners", { color: theme.orange }),
              heading("The partners helping LEA reach learners.", 2, {
                fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem",
              }),
              copy("We work with institutions, community organizations, schools, and technology partners to keep programs practical and accessible.", {
                maxWidth: "760px",
              })
            ),
            actionButton("/contact", "Partner With Us", "purple"),
          ],
        }),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
            gap: "16px",
          },
          children: [
            partnerLogoCard("Mukuru Slums Development Project", "Community project", "images/msdp_logo.png"),
            partnerLogoCard("TUK", "Academic partner", "images/tuk-logo.jpg"),
            partnerLogoCard("Mogra", "Rescue centre", "images/mogra.png"),
            partnerLogoCard("Volo Technologies Limited", "Technology partner", "images/v1.png"),
          ],
        })
      )
    )
  );

const partnerLogoCard = (name: string, label: string, logoSrc?: string): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      minHeight: "180px",
      alignContent: "center",
      justifyItems: "center",
      gap: "12px",
      padding: "24px",
      background: theme.white,
      border: `1px solid ${theme.line}`,
      borderTop: `5px solid ${theme.purple}`,
      textAlign: "center",
      boxShadow: "0 14px 32px rgba(44, 0, 62, 0.07)",
    },
    children: [
      logoSrc
        ? create("img", {
            attrs: { src: logoSrc, alt: `${name} logo` },
            style: { width: "min(170px, 100%)", height: "74px", objectFit: "contain" },
          })
        : create("div", {
            text: name === "Volo Technologies Limited" ? "VOLO" : name,
            style: {
              display: "grid",
              placeItems: "center",
              minWidth: "132px",
              minHeight: "74px",
              padding: "8px 14px",
              background: theme.purple,
              color: theme.white,
              fontSize: name === "Volo Technologies Limited" ? "1.4rem" : "1.7rem",
              fontWeight: "700",
              letterSpacing: "0.08em",
            },
          }),
      stack(
        4,
        heading(name, 3, { color: theme.purple, fontSize: "1.18rem" }),
        copy(label, { color: theme.muted, fontSize: "0.94rem", lineHeight: "1.35" })
      ),
    ],
  });

const eventsPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "LEA events content" },
    style: { background: theme.paper },
    children: [eventsHero(), upcomingEventsSection(), pastEventsSection(), eventsQuoteSection(), landingFooter()],
  });

const eventsHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "520px" : "500px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/Dinner.jpeg", "LEA Organization gala event moment", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectPosition: "center",
        filter: "brightness(0.44) contrast(1.1) saturate(1.03)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(21,0,31,0.84) 50%, rgba(0,0,0,0.42) 100%)",
        },
      }),
      container(
        create("div", {
          style: { position: "relative", zIndex: "2", maxWidth: currentBreakpoint === "desktop" ? "790px" : "100%" },
          children: [
            stack(
              18,
              eyebrow("Stay Updated", { color: theme.orange }),
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: "760px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 4px 22px rgba(0,0,0,0.52)",
                },
                children: ["Events and ", create("span", { text: "Highlights", style: { color: theme.orange } })],
              }),
              copy("Get updates on our latest events and enjoy a recap of the past ones.", {
                color: theme.white,
                maxWidth: "700px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("#upcoming-events", "Upcoming Event"), actionButton("#past-events", "All Events", "outline")],
              })
            ),
          ],
        })
      ),
    ],
  });

const upcomingEventsSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 94px" : "62px 0 70px",
    container(
      stack(
        30,
        stack(
          10,
          eyebrow("Upcoming Events", { color: theme.orange }),
          heading("LEA Organization 2nd Anniversary Gala", 2, {
            fontSize: currentBreakpoint === "desktop" ? "2.7rem" : "2rem",
          }),
          copy("May 23rd 2026, Nairobi", { color: theme.purple, fontWeight: "700", maxWidth: "760px" })
        ),
        create("article", {
          attrs: { id: "upcoming-events" },
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "1.08fr 0.92fr" : "1fr",
            overflow: "hidden",
            background: theme.purple,
            boxShadow: "0 22px 52px rgba(44,0,62,0.16)",
          },
          children: [
            create("div", {
              style: {
                minHeight: currentBreakpoint === "desktop" ? "430px" : "270px",
                overflow: "hidden",
                background: theme.plum,
              },
              children: [
                image("images/Dinner.jpeg", "LEA Organization anniversary gala dinner table", {
                  objectPosition: "center",
                  filter: "brightness(0.78) contrast(1.06) saturate(1.04)",
                }),
              ],
            }),
            create("div", {
              style: {
                display: "grid",
                alignContent: "center",
                gap: "16px",
                padding: currentBreakpoint === "desktop" ? "44px" : "28px 24px",
              },
              children: [
                eyebrow("May 23rd 2026 / Nairobi", { color: theme.orange }),
                heading("Celebrate another year of impact and growth.", 3, {
                  color: theme.white,
                  fontSize: currentBreakpoint === "desktop" ? "2rem" : "1.55rem",
                  lineHeight: "1.12",
                }),
                copy("Join us for an evening filled with great food, inspiring stories, and exciting moments as we mark LEA Organization's second anniversary.", {
                  color: "#eadbed",
                  fontSize: "1.02rem",
                }),
                create("div", {
                  style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px" },
                  children: [actionButton("/contact", "Contact Us"), actionButton("#past-events", "View Past Events", "outline")],
                }),
              ],
            }),
          ],
        })
      )
    )
  );

const pastEventsSection = (): HTMLElement =>
  section(
    theme.purple,
    currentBreakpoint === "desktop" ? "88px 0 98px" : "62px 0 72px",
    wideCardsContainer(
      stack(
        34,
        stack(
          10,
          eyebrow("Past Events Highlights", { color: theme.orange }),
          heading("Moments that shaped the movement.", 2, {
            color: theme.white,
            fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem",
          }),
          copy("Browse past meetups, graduations, outreach days, celebrations, and learning moments from the LEA community.", {
            color: "#eadbed",
            maxWidth: "820px",
          })
        ),
        create("div", {
          attrs: { id: "past-events" },
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(3, minmax(0, 1fr))" : "1fr",
            gap: "18px",
          },
          children: eventItems.map((event) => eventHighlightCard(event)),
        })
      )
    )
  );

const eventHighlightCard = (event: EventItem): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      gridTemplateRows: currentBreakpoint === "desktop" ? "340px minmax(0, 1fr)" : "300px auto",
      overflow: "hidden",
      background: "transparent",
      border: "0",
      boxShadow: "none",
    },
    children: [
      create("div", {
        style: { position: "relative", overflow: "hidden", background: theme.plum },
        children: [
          image(event.image, event.title, {
            objectPosition: "center",
            filter: "saturate(1.03) contrast(1.04)",
          }),
          create("span", {
            text: "Past Event",
            style: {
              position: "absolute",
              left: "14px",
              top: "14px",
              padding: "7px 10px",
              background: theme.white,
              color: theme.purple,
              fontSize: "0.74rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            },
          }),
        ],
      }),
      create("div", {
        style: {
          display: "grid",
          gridTemplateRows: "auto auto minmax(0, 1fr) auto",
          gap: "10px",
          padding: "22px",
        },
        children: [
          heading(event.title, 3, { color: theme.orange, fontSize: "1.24rem", textTransform: "uppercase" }),
          eyebrow(event.date, { color: theme.orange }),
          copy(event.text, { color: "#eadbed", fontSize: "0.96rem", lineHeight: "1.5" }),
          create("a", {
            attrs: { href: event.visuals ?? event.image, target: "_blank", rel: "noreferrer" },
            text: "Visuals",
            style: {
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40px",
              padding: "10px 16px",
              marginTop: "6px",
              background: theme.orange,
              border: `1px solid ${theme.orange}`,
              color: theme.plum,
              fontWeight: "700",
              lineHeight: "1",
              textDecoration: "none",
            },
          }),
        ],
      }),
    ],
  });

const eventsQuoteSection = (): HTMLElement =>
  section(
    "#050505",
    currentBreakpoint === "desktop" ? "76px 0 82px" : "58px 0 64px",
    container(
      stack(
        18,
        heading("\"Empowerment through knowledge and collaboration!\"", 2, {
          color: theme.white,
          maxWidth: "900px",
          fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem",
        }),
        copy("LEA Organization", { color: theme.orange, fontWeight: "700", fontSize: "1rem" })
      )
    )
  );

const fieldLabelStyle = (): StyleMap => ({
  display: "grid",
  gap: "7px",
  color: theme.white,
  fontSize: "0.9rem",
  fontWeight: "700",
});

const fieldControlStyle = (): StyleMap => ({
  width: "100%",
  minHeight: "46px",
  padding: "12px 13px",
  border: "1px solid rgba(255,255,255,0.24)",
  borderRadius: "0",
  background: "rgba(255,255,255,0.08)",
  color: theme.white,
  font: "inherit",
});

const formInput = (label: string, name: string, placeholder: string, type = "text", required = true): HTMLElement =>
  create("label", {
    style: fieldLabelStyle(),
    children: [
      label,
      create("input", {
        attrs: { name, type, placeholder, required },
        style: fieldControlStyle(),
      }),
    ],
  });

const formSelect = (label: string, name: string, options: string[]): HTMLElement =>
  create("label", {
    style: fieldLabelStyle(),
    children: [
      label,
      create("select", {
        attrs: { name, required: true },
        style: { ...fieldControlStyle(), color: theme.ink, background: theme.white },
        children: [
          create("option", { attrs: { value: "" }, text: "Select one" }),
          ...options.map((option) => create("option", { attrs: { value: option }, text: option })),
        ],
      }),
    ],
  });

const formTextArea = (label: string, name: string, placeholder: string): HTMLElement =>
  create("label", {
    style: fieldLabelStyle(),
    children: [
      label,
      create("textarea", {
        attrs: { name, placeholder, required: true, rows: 5 },
        style: { ...fieldControlStyle(), minHeight: "132px", resize: "vertical" },
      }),
    ],
  });

const formSubmit = (text: string): HTMLButtonElement =>
  create("button", {
    attrs: { type: "submit" },
    text,
    style: {
      minHeight: "46px",
      width: "fit-content",
      padding: "12px 20px",
      border: `1px solid ${theme.orange}`,
      background: theme.orange,
      color: theme.plum,
      fontWeight: "700",
      font: "inherit",
      cursor: "pointer",
    },
  });

const interestForm = (formType: string, title: string, text: string, submitText: string, fields: HTMLElement[]): HTMLFormElement =>
  create("form", {
    attrs: { action: scriptAction, method: "post" },
    style: {
      display: "grid",
      alignContent: "start",
      gap: "16px",
      padding: currentBreakpoint === "desktop" ? "28px" : "24px",
      background: theme.purple,
      border: `1px solid ${theme.purple}`,
      borderTop: `5px solid ${theme.orange}`,
      boxShadow: "0 18px 40px rgba(44, 0, 62, 0.14)",
    },
    children: [
      create("input", { attrs: { type: "hidden", name: "formType", value: formType } }),
      stack(
        8,
        heading(title, 3, { color: theme.orange, fontSize: "1.45rem" }),
        copy(text, { color: "#eadbed", fontSize: "0.98rem", lineHeight: "1.5" })
      ),
      ...fields,
      formSubmit(submitText),
    ],
  });

const volunteerPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "Volunteer with LEA" },
    style: { background: theme.paper },
    children: [volunteerHero(), volunteerRolesSection(), volunteerPeopleSection(), volunteerSignupSection(), landingFooter()],
  });

const volunteerHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "560px" : "520px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/LEA pics/LEA-29.jpg", "Volunteer mentoring LEA learners", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectPosition: "center",
        filter: "brightness(0.42) contrast(1.1) saturate(1.03)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(21,0,31,0.84) 48%, rgba(0,0,0,0.42) 100%)",
        },
      }),
      container(
        create("div", {
          style: { position: "relative", zIndex: "2", maxWidth: currentBreakpoint === "desktop" ? "790px" : "100%" },
          children: [
            stack(
              18,
              eyebrow("Volunteer", { color: theme.orange }),
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: "760px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 4px 22px rgba(0,0,0,0.52)",
                },
                children: ["Show up for ", create("span", { text: "young builders", style: { color: theme.orange } }), "."],
              }),
              copy("LEA volunteers mentor, teach, organize sessions, document stories, and help learners discover what they can build with technology.", {
                color: theme.white,
                maxWidth: "720px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("#sign-up", "Volunteer Form"), actionButton("/contact", "Partner Or Donate", "outline")],
              })
            ),
          ],
        })
      ),
    ],
  });

const volunteerRolesSection = (): HTMLElement => {
  const roles = [
    ["Mentor And Teach", "Guide learners through Scratch, web development, app thinking, and project confidence."],
    ["Support Program Days", "Help with setup, attendance, learner support, coordination, and smooth session flow."],
    ["Document The Work", "Capture photos, videos, stories, and updates that help the community see the impact."],
    ["Events And Logistics", "Support graduations, meetups, hackathons, outreach days, and partner activities."],
  ] as const;

  return section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 94px" : "62px 0 70px",
    container(
      stack(
        32,
        stack(
          10,
          eyebrow("How Volunteers Help", { color: theme.orange }),
          heading("Many skills can serve the mission.", 2, { fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem" }),
          copy("You do not need to fit one narrow profile. LEA needs technical mentors, organizers, storytellers, and people who can consistently care about learner progress.", {
            maxWidth: "820px",
          })
        ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
            gap: "16px",
          },
          children: roles.map(([title, text], index) => volunteerRoleCard(title, text, index)),
        })
      )
    )
  );
};

const volunteerRoleCard = (title: string, text: string, index: number): HTMLElement =>
  create("article", {
    style: {
      minHeight: currentBreakpoint === "desktop" ? "230px" : "auto",
      display: "grid",
      alignContent: "start",
      gap: "12px",
      padding: "24px",
      background: theme.purple,
      borderTop: `5px solid ${theme.orange}`,
      color: theme.white,
      boxShadow: "0 16px 36px rgba(44, 0, 62, 0.11)",
    },
    children: [
      create("span", {
        text: String(index + 1).padStart(2, "0"),
        style: {
          width: "44px",
          height: "44px",
          display: "inline-grid",
          placeItems: "center",
          background: theme.white,
          color: theme.purple,
          fontWeight: "700",
        },
      }),
      heading(title, 3, { color: theme.orange, fontSize: "1.24rem" }),
      copy(text, { color: "#eadbed", fontSize: "0.96rem", lineHeight: "1.52" }),
    ],
  });

const volunteerPeopleSection = (): HTMLElement => {
  const track = create("div", {
    style: {
      display: "grid",
      gridAutoFlow: "column",
      gridAutoColumns: currentBreakpoint === "desktop" ? "calc((100% - 108px) / 7)" : "calc((100% - 16px) / 2)",
      gap: currentBreakpoint === "desktop" ? "18px" : "16px",
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
      overflowY: "hidden",
      padding: "2px 0 18px",
      scrollSnapType: "x proximity",
      scrollBehavior: "smooth",
      overscrollBehaviorX: "contain",
      WebkitOverflowScrolling: "touch",
    },
    children: volunteers.map((person) => volunteerPersonCard(person)),
  });

  const scrollVolunteers = (direction: -1 | 1): void => {
    const distance = Math.max(track.clientWidth, 320);
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return section(
    theme.purple,
    currentBreakpoint === "desktop" ? "86px 0 96px" : "62px 0 70px",
    wideCardsContainer(
      stack(
        32,
        stack(
          10,
          eyebrow("Volunteer Community", { color: theme.orange }),
          heading("The people who show up.", 2, {
            color: theme.white,
            fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem",
          }),
          copy("Meet the volunteer community behind LEA sessions, events, and learner support.", {
            color: "#eadbed",
            maxWidth: "760px",
          })
        ),
        create("div", {
          style: {
            position: "relative",
            maxWidth: "100%",
            overflow: "hidden",
          },
          children: [
            volunteerScrollButton("‹", "left", () => scrollVolunteers(-1)),
            create("div", {
              style: {
                marginInline: currentBreakpoint === "desktop" ? "62px" : "48px",
                overflow: "hidden",
              },
              children: [track],
            }),
            volunteerScrollButton("›", "right", () => scrollVolunteers(1)),
          ],
        })
      )
    )
  );
};

const volunteerScrollButton = (label: string, side: "left" | "right", onClick: () => void): HTMLButtonElement =>
  create("button", {
    attrs: { type: "button", "aria-label": side === "left" ? "Scroll volunteers left" : "Scroll volunteers right" },
    text: label,
    onClick,
    style: {
      position: "absolute",
      top: currentBreakpoint === "desktop" ? "48px" : "54px",
      [side]: currentBreakpoint === "desktop" ? "8px" : "0",
      zIndex: "3",
      display: "grid",
      placeItems: "center",
      width: currentBreakpoint === "desktop" ? "50px" : "42px",
      height: currentBreakpoint === "desktop" ? "50px" : "42px",
      border: `2px solid ${theme.white}`,
      borderRadius: "999px",
      background: theme.orange,
      color: theme.plum,
      fontSize: currentBreakpoint === "desktop" ? "2.1rem" : "1.8rem",
      fontWeight: "700",
      lineHeight: "0.8",
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(0,0,0,0.3)",
    },
  });

const volunteerPersonCard = (person: Person): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      justifyItems: "center",
      alignContent: "start",
      gap: "10px",
      minWidth: "0",
      width: "100%",
      scrollSnapAlign: "start",
      textAlign: "center",
      color: theme.white,
    },
    children: [
      create("div", {
        style: {
          width: currentBreakpoint === "desktop" ? "116px" : "132px",
          height: currentBreakpoint === "desktop" ? "116px" : "132px",
          overflow: "hidden",
          borderRadius: "999px",
          background: theme.plum,
          border: `4px solid ${theme.orange}`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
        },
        children: [
          image(person.image, person.name, {
            objectFit: "contain",
            objectPosition: "center center",
            padding: "5px",
            background: theme.plum,
          }),
        ],
      }),
      heading(person.name, 3, { color: theme.white, fontSize: "1rem", lineHeight: "1.15" }),
      copy(person.role, { color: "#eadbed", fontSize: "0.86rem", lineHeight: "1.35" }),
    ],
  });

const volunteerSignupSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 94px" : "62px 0 70px",
    container(
      create("div", {
        attrs: { id: "sign-up" },
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "0.9fr 1.1fr" : "1fr",
          gap: currentBreakpoint === "desktop" ? "44px" : "28px",
          alignItems: "start",
        },
        children: [
          stack(
            14,
            eyebrow("Sign Up", { color: theme.orange }),
            heading("Tell us how you want to volunteer.", 2, { fontSize: currentBreakpoint === "desktop" ? "2.55rem" : "2rem" }),
            copy("Share your skills, availability, and the type of support you want to offer. We will use this to match you to sessions, events, or mentorship needs."),
            aboutImagePanel("images/community.PNG", "LEA volunteers and community members", "Volunteer together", "brightness(0.58) contrast(1.08) saturate(1.04)"),
          ),
          volunteerInterestForm(),
        ],
      })
    )
  );

const volunteerInterestForm = (): HTMLFormElement =>
  interestForm("Volunteer", "Volunteer form", "For mentors, facilitators, event helpers, media support, and anyone ready to show up.", "Submit Volunteer Interest", [
    formInput("Full name", "fullName", "Your name"),
    formInput("Email address", "email", "you@example.com", "email"),
    formInput("Phone number", "phone", "+254 ...", "tel"),
    formSelect("How would you like to help?", "volunteerArea", ["Teaching / Mentorship", "Program support", "Events and logistics", "Photography / media", "General volunteering"]),
    formSelect("Availability", "availability", ["Weekends", "Weekdays", "Online support", "Flexible"]),
    formTextArea("Short note", "message", "Tell us about your skills, experience, or why you want to volunteer."),
  ]);

const contactPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "Contact LEA Organization" },
    style: { background: theme.paper },
    children: [contactHero(), contactFormsSection(), contactInfoSection(), landingFooter()],
  });

const contactHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "500px" : "480px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/LEA pics/LEA-24.jpg", "LEA learners and partners together", {
        position: "absolute",
        inset: "0",
        zIndex: "0",
        objectPosition: "center",
        filter: "brightness(0.42) contrast(1.1) saturate(1.02)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(21,0,31,0.84) 48%, rgba(0,0,0,0.42) 100%)",
        },
      }),
      container(
        create("div", {
          style: { position: "relative", zIndex: "2", maxWidth: currentBreakpoint === "desktop" ? "790px" : "100%" },
          children: [
            stack(
              18,
              eyebrow("Contact", { color: theme.orange }),
              create("h1", {
                style: {
                  margin: "0",
                  color: theme.white,
                  maxWidth: "760px",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                  fontWeight: "700",
                  lineHeight: "1.05",
                  letterSpacing: "0",
                  textShadow: "0 4px 22px rgba(0,0,0,0.52)",
                },
                children: ["Support the ", create("span", { text: "mission", style: { color: theme.orange } }), "."],
              }),
              copy("Choose the path that fits you: partner with LEA, volunteer your time, or support learning resources through a donation inquiry.", {
                color: theme.white,
                maxWidth: "720px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
            ),
          ],
        })
      ),
    ],
  });

const contactFormsSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 96px" : "62px 0 70px",
    wideCardsContainer(
      stack(
        32,
        stack(
          10,
          eyebrow("Get Involved", { color: theme.orange }),
          heading("Partner, volunteer, or donate.", 2, { fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem" }),
          copy("Use the form that matches your next step. Each one gives LEA the details needed to follow up clearly.", {
            maxWidth: "820px",
          })
        ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(3, minmax(0, 1fr))" : "1fr",
            gap: "18px",
          },
          children: [partnerInterestForm(), volunteerInterestForm(), donateInterestForm()],
        })
      )
    )
  );

const partnerInterestForm = (): HTMLFormElement =>
  interestForm("Partner", "Partner form", "For schools, community projects, companies, and organizations that want to host or support LEA programs.", "Submit Partner Interest", [
    formInput("Organization name", "organization", "School, project, company, or group"),
    formInput("Contact person", "fullName", "Your name"),
    formInput("Email address", "email", "you@example.com", "email"),
    formInput("Phone number", "phone", "+254 ...", "tel"),
    formSelect("Partnership interest", "partnerArea", ["Host a program", "Sponsor devices/resources", "Corporate volunteering", "Training collaboration", "Other partnership"]),
    formTextArea("What would you like to build with LEA?", "message", "Share the learners, location, timeline, or support you have in mind."),
  ]);

const donateInterestForm = (): HTMLFormElement =>
  interestForm("Donate", "Donation form", "For people who want to support sessions, devices, transport, learning materials, or events.", "Submit Donation Interest", [
    formInput("Full name", "fullName", "Your name"),
    formInput("Email address", "email", "you@example.com", "email"),
    formInput("Phone number", "phone", "+254 ...", "tel"),
    formSelect("Donation focus", "donationFocus", ["Learning materials", "Devices / equipment", "Program meals and transport", "Events and graduations", "General support"]),
    formInput("Estimated amount or support", "amount", "Amount, items, or services", "text", false),
    formTextArea("Message", "message", "Tell us how you would like to support."),
  ]);

const contactInfoSection = (): HTMLElement =>
  section(
    theme.purple,
    currentBreakpoint === "desktop" ? "76px 0 84px" : "56px 0 64px",
    container(
      create("div", {
        style: {
          display: "grid",
          gridTemplateColumns: currentBreakpoint === "desktop" ? "1fr 1fr" : "1fr",
          gap: "22px",
          alignItems: "center",
        },
        children: [
          stack(
            12,
            eyebrow("Direct Contact", { color: theme.orange }),
            heading("Prefer to talk first?", 2, { color: theme.white, fontSize: currentBreakpoint === "desktop" ? "2.45rem" : "2rem" }),
            copy("Reach out directly and we will guide you to the right next step.", { color: "#eadbed", maxWidth: "620px" })
          ),
          create("div", {
            style: { display: "grid", gap: "12px" },
            children: [
              contactInfoCard("Phone", "+254 746 821567"),
              contactInfoCard("Email", "leaorganization@gmail.com"),
              contactInfoCard("Location", "Nairobi, Kenya"),
            ],
          }),
        ],
      })
    )
  );

const contactInfoCard = (label: string, value: string): HTMLElement =>
  create("article", {
    style: {
      padding: "20px",
      background: theme.white,
      borderLeft: `5px solid ${theme.orange}`,
    },
    children: [
      stack(
        4,
        eyebrow(label, { color: theme.orange }),
        heading(value, 3, { color: theme.purple, fontSize: "1.22rem" })
      ),
    ],
  });

type LandingAction = {
  title: string;
  label: string;
  text: string;
  image: string;
  alt: string;
  href: string;
  button: string;
};

const landingActionsSection = (): HTMLElement => {
  const actions: LandingAction[] = [
    {
      title: "What We Do",
      label: "Technology access",
      text: "We open doors to technology for young learners aged 9 to 18 through practical coding, mentorship, and digital confidence.",
      image: "images/LEA pics/LEA-3.jpg",
      alt: "LEA learners during a technology session",
      href: "/programs",
      button: "View Programs",
    },
    {
      title: "Give Donation",
      label: "Fuel the mission",
      text: "Your donation supports learning resources, sessions, devices, and opportunities for children who lack access.",
      image: "images/LEA pics/LEA-29.jpg",
      alt: "Volunteer mentoring LEA learners",
      href: "/contact",
      button: "Donate Now",
    },
    {
      title: "Become a Volunteer",
      label: "Mentor and teach",
      text: "Share your expertise, encourage young minds, and help learners discover what they can build with technology.",
      image: "images/community.PNG",
      alt: "LEA volunteers and community members",
      href: "/volunteer",
      button: "Volunteer",
    },
    {
      title: "Become a Partner",
      label: "Grow the impact",
      text: "Partner with us to expand access, strengthen programs, and create meaningful opportunities for young learners.",
      image: "images/LEA pics/LEA-24.jpg",
      alt: "LEA learners working together",
      href: "/contact",
      button: "Partner With Us",
    },
  ];

  return section(
    theme.white,
    currentBreakpoint === "desktop" ? "88px 0 96px" : "62px 0 70px",
    wideCardsContainer(
      create("div", {
        style: {
          display: "grid",
          gap: currentBreakpoint === "desktop" ? "38px" : "28px",
        },
        children: [
          stack(
            16,
            create("div", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "10px",
              },
              children: [
                create("span", {
                  attrs: { "aria-hidden": "true" },
                  style: { width: "24px", height: "1px", background: theme.orange },
                }),
                eyebrow("LEA Organization: Get Involved", { color: theme.orange }),
              ],
            }),
            heading("Choose how you want to support the mission.", 2, {
              maxWidth: currentBreakpoint === "desktop" ? "760px" : "100%",
              fontSize: currentBreakpoint === "desktop" ? "3.15rem" : "2.25rem",
              lineHeight: "1.04",
              color: "#111018",
            }),
            copy("Explore what we do, give, volunteer, or partner with us to help more young learners access technology.", {
              maxWidth: "760px",
              color: "#17111b",
              fontSize: currentBreakpoint === "desktop" ? "1rem" : "0.98rem",
            })
          ),
          create("div", {
            style: {
              display: "grid",
              gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
              gap: currentBreakpoint === "desktop" ? "18px" : "20px",
            },
            children: actions.map((action, index) => landingActionCard(action, index)),
          }),
        ],
      })
    )
  );
};

const landingActionCard = (action: LandingAction, index: number): HTMLElement =>
  section(
    "transparent",
    "0",
    interactive(
      create("article", {
        style: {
          display: "grid",
          gridTemplateRows: currentBreakpoint === "desktop" ? "232px minmax(272px, auto)" : "230px auto",
          minHeight: currentBreakpoint === "desktop" ? "486px" : "auto",
          overflow: "hidden",
          background: theme.purple,
          border: `1px solid ${theme.purple}`,
          borderRadius: "0",
          boxShadow: "0 18px 34px rgba(0, 0, 0, 0.18)",
        },
        children: [
          create("div", {
            style: {
              minHeight: currentBreakpoint === "desktop" ? "232px" : "230px",
            },
            children: [
              image(action.image, action.alt, {
                height: currentBreakpoint === "desktop" ? "232px" : "230px",
                borderRadius: "0",
                objectPosition: index === 2 ? "center 42%" : "center",
                filter: "saturate(1.02) contrast(1.03)",
              }),
            ],
          }),
          create("div", {
            style: {
              display: "grid",
              gridTemplateRows: "auto auto minmax(0, 1fr) auto",
              alignContent: "stretch",
              gap: "12px",
              padding: currentBreakpoint === "desktop" ? "24px 24px 26px" : "22px",
            },
            children: [
              heading(action.title, 3, {
                color: theme.orange,
                fontSize: currentBreakpoint === "desktop" ? "1.42rem" : "1.45rem",
                lineHeight: "1.08",
              }),
              eyebrow(action.label, { color: theme.orange }),
              copy(action.text, { color: "#f4e8f7", fontSize: "0.94rem", lineHeight: "1.58" }),
              create("a", {
                attrs: { href: action.href },
                text: action.button,
                style: {
                  display: "inline-flex",
                  width: "fit-content",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "42px",
                  padding: "11px 18px",
                  marginTop: "8px",
                  borderRadius: "0",
                  background: theme.orange,
                  border: `1px solid ${theme.orange}`,
                  color: theme.plum,
                  fontWeight: "700",
                  lineHeight: "1",
                  textDecoration: "none",
                },
              }),
            ],
          }),
        ],
      }),
      {
        transform: "translateY(0)",
        borderColor: theme.purple,
        boxShadow: "0 18px 34px rgba(44, 0, 62, 0.16)",
      },
      {
        transform: "translateY(-4px)",
        borderColor: "rgba(248, 157, 53, 0.5)",
        boxShadow: "0 24px 46px rgba(44, 0, 62, 0.13)",
      }
    )
  );

const supportCollageSection = (): HTMLElement =>
  section(
    theme.purple,
    currentBreakpoint === "desktop" ? "88px 0 96px" : "62px 0 70px",
    container(
      stack(
        28,
        stack(
          10,
          eyebrow("Gallery", { color: theme.orange }),
          heading("Moments From LEA Organization", 2, {
            color: theme.white,
            fontSize: currentBreakpoint === "desktop" ? "2.35rem" : "1.9rem",
          })
        ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "0.9fr 1.2fr 0.95fr" : "1fr",
            gridTemplateRows: currentBreakpoint === "desktop" ? "repeat(3, 178px)" : "auto",
            gap: currentBreakpoint === "desktop" ? "0" : "16px",
            alignItems: "stretch",
            border: currentBreakpoint === "desktop" ? "1px solid rgba(255,255,255,0.14)" : "0",
            background: theme.white,
          },
          children: [
            supportImageTile("images/M1.jpeg", "LEA learners during a Mogra program session", {
              gridColumn: currentBreakpoint === "desktop" ? "1" : "auto",
              gridRow: currentBreakpoint === "desktop" ? "1" : "auto",
              minHeight: currentBreakpoint === "desktop" ? "178px" : "220px",
            }),
            supportImageTile("images/M2.jpeg", "LEA mentor supporting learners during a program activity", {
              gridColumn: currentBreakpoint === "desktop" ? "1" : "auto",
              gridRow: currentBreakpoint === "desktop" ? "2" : "auto",
              minHeight: currentBreakpoint === "desktop" ? "178px" : "220px",
            }),
            supportImageTile("images/M3.jpeg", "LEA learners and mentors in a community session", {
              gridColumn: currentBreakpoint === "desktop" ? "1" : "auto",
              gridRow: currentBreakpoint === "desktop" ? "3" : "auto",
              minHeight: currentBreakpoint === "desktop" ? "178px" : "220px",
            }),
            supportImageTile("images/Happy.jpeg", "LEA learners smiling during a learning day", {
              gridColumn: currentBreakpoint === "desktop" ? "2" : "auto",
              gridRow: currentBreakpoint === "desktop" ? "1 / span 3" : "auto",
              minHeight: currentBreakpoint === "desktop" ? "534px" : "320px",
            }),
            create("article", {
            style: {
              gridColumn: currentBreakpoint === "desktop" ? "3" : "auto",
              gridRow: currentBreakpoint === "desktop" ? "1 / span 2" : "auto",
              display: "grid",
              alignContent: "center",
              gap: "18px",
              padding: currentBreakpoint === "desktop" ? "44px 36px" : "30px 24px",
              background: "#050505",
              borderLeft: currentBreakpoint === "desktop" ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.14)",
              borderRight: currentBreakpoint === "desktop" ? "0" : "1px solid rgba(255,255,255,0.14)",
              borderTop: currentBreakpoint === "desktop" ? "0" : "1px solid rgba(255,255,255,0.14)",
            },
            children: [
              create("div", {
                style: { display: "flex", alignItems: "center", gap: "10px" },
                children: [
                  create("span", { attrs: { "aria-hidden": "true" }, style: { width: "24px", height: "1px", background: theme.orange } }),
                  eyebrow("Support", { color: theme.orange }),
                ],
              }),
              heading("We need your support", 2, {
                color: theme.white,
                maxWidth: "360px",
                fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2.1rem",
                lineHeight: "1.05",
              }),
              copy("Your partnership helps us grow programs that center learners, schools, and communities. Every donation strengthens the movement.", {
                maxWidth: "420px",
                color: "#d8d0dc",
                fontSize: "1rem",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px" },
                children: [supportButton("/contact", "Donate", true), supportButton("/contact", "Partner", false)],
              }),
            ],
          }),
          supportImageTile("images/M7.jpeg", "LEA community program moment", {
            gridColumn: currentBreakpoint === "desktop" ? "3" : "auto",
            gridRow: currentBreakpoint === "desktop" ? "3" : "auto",
            minHeight: currentBreakpoint === "desktop" ? "178px" : "220px",
          }),
          ],
        })
      )
    )
  );

const supportImageTile = (src: string, alt: string, extra: StyleMap = {}): HTMLElement =>
  create("figure", {
    style: {
      position: "relative",
      overflow: "hidden",
      margin: "0",
      background: theme.plum,
      ...extra,
    },
    children: [image(src, alt, { objectPosition: "center", filter: "saturate(1.02) contrast(1.03)" })],
  });

const supportButton = (href: string, text: string, filled: boolean): HTMLAnchorElement =>
  create("a", {
    attrs: { href },
    text,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "46px",
      padding: "13px 22px",
      background: filled ? theme.orange : "transparent",
      border: filled ? `1px solid ${theme.orange}` : "1px solid rgba(255,255,255,0.46)",
      color: filled ? theme.plum : theme.white,
      fontSize: "0.78rem",
      fontWeight: "700",
      letterSpacing: "0.08em",
      lineHeight: "1",
      textDecoration: "none",
    },
  });

const landingFooter = (): HTMLElement =>
  create("footer", {
    style: {
      background: "#050505",
      color: theme.white,
      padding: currentBreakpoint === "desktop" ? "64px 0 30px" : "44px 0 26px",
      borderTop: "1px solid rgba(255,255,255,0.12)",
    },
    children: [
      container(
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "1.1fr 0.85fr 1.2fr" : "1fr",
            gap: currentBreakpoint === "desktop" ? "70px" : "34px",
            alignItems: "start",
            paddingBottom: "38px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          },
          children: [
            footerBrandColumn(),
            footerLinksColumn(),
            footerGalleryColumn(),
          ],
        }),
        create("div", {
          style: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "18px",
            paddingTop: "24px",
            color: "#b8aabc",
            fontSize: "0.95rem",
          },
          children: [
            create("span", { text: "+254 746 821567", style: { color: theme.white, fontWeight: "700" } }),
            create("a", { attrs: { href: "mailto:leaorganization@gmail.com" }, text: "leaorganization@gmail.com", style: { color: theme.white, fontWeight: "700", textDecoration: "none" } }),
            create("span", { text: "Copyright 2026 LEA Organization. All rights reserved." }),
          ],
        })
      ),
    ],
  });

const footerBrandColumn = (): HTMLElement =>
  stack(
    18,
    stack(
      8,
      heading("LEA Organization", 3, { color: theme.white, fontSize: "1.35rem", textTransform: "uppercase" })
    ),
    stack(
      2,
      create("strong", { text: "Nairobi", style: { color: theme.white, fontSize: "1rem" } }),
      create("span", { text: "Kenya", style: { color: "#b8aabc", fontWeight: "700" } })
    ),
    create("div", {
      style: { display: "flex", gap: "10px", marginTop: "2px" },
      children: [
        footerSocial("IG", "#"),
        footerSocial("X", "#"),
        footerSocial("in", "#"),
      ],
    })
  );

const footerSocial = (label: string, href: string): HTMLAnchorElement => {
  const socialColors: Record<string, string> = { IG: "#e4405f", X: "#ffffff", in: "#0a66c2" };

  return create("a", {
    attrs: { href, "aria-label": label },
    text: label,
    style: {
      width: "42px",
      height: "42px",
      display: "inline-grid",
      placeItems: "center",
      border: "1px solid rgba(255,255,255,0.16)",
      color: socialColors[label] ?? theme.white,
      fontSize: "0.82rem",
      fontWeight: "700",
      textDecoration: "none",
    },
  });
};

const footerLinksColumn = (): HTMLElement => {
  const links = [
    ["Home", "/"],
    ["Projects", "/projects"],
    ["Volunteer", "/volunteer"],
    ["Team", "/about"],
    ["Events", "/events"],
    ["Contact", "/contact"],
  ] as const;

  return stack(
    18,
    heading("Quick Links", 3, { color: theme.white, fontSize: "1.35rem" }),
    create("nav", {
      attrs: { "aria-label": "Footer quick links" },
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "14px 30px",
      },
      children: links.map(([label, href]) =>
        create("a", {
          attrs: { href },
          text: label,
          style: { color: "#d8d0dc", fontSize: "1rem", textDecoration: "none" },
        })
      ),
    })
  );
};

const footerGalleryColumn = (): HTMLElement => {
  const thumbnails = [
    ["images/LEA pics/LEA-24.jpg", "LEA learners collaborating"],
    ["images/LEA pics/LEA-3.jpg", "LEA classroom session"],
    ["images/LEA pics/LEA-29.jpg", "Mentorship moment"],
    ["images/community.PNG", "LEA community group"],
    ["images/LEA - HIGHWAY-28.jpg", "Learner presentation"],
    ["images/LEA pics/coding16.jpg", "Coding class"],
  ] as const;

  return stack(
    18,
    heading("Gallery", 3, { color: theme.white, fontSize: "1.35rem" }),
    create("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 96px))",
        gap: "6px",
      },
      children: thumbnails.map(([src, alt]) =>
        create("figure", {
          style: { margin: "0", height: "66px", overflow: "hidden", background: theme.plum },
          children: [image(src, alt, { objectPosition: "center" })],
        })
      ),
    })
  );
};

type AboutValue = {
  title: string;
  text: string;
};

type AboutIcon = "target" | "eye" | "focus" | "route";

const aboutIcon = (icon: AboutIcon, color = theme.purple): SVGSVGElement => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", color);
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  const paths: Record<AboutIcon, string[]> = {
    target: ["M12 2v4", "M12 18v4", "M2 12h4", "M18 12h4", "M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12", "M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4"],
    eye: ["M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12", "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6"],
    focus: ["M4 8V5a1 1 0 0 1 1-1h3", "M16 4h3a1 1 0 0 1 1 1v3", "M20 16v3a1 1 0 0 1-1 1h-3", "M8 20H5a1 1 0 0 1-1-1v-3", "M9 12h6", "M12 9v6"],
    route: ["M4 19c4 0 4-4 8-4s4 4 8 4", "M4 5c4 0 4 4 8 4s4-4 8-4", "M4 5v14", "M20 5v14"],
  };

  paths[icon].forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  });

  return svg;
};

const aboutPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "About LEA Organization" },
    style: { background: theme.paper },
    children: [aboutHero(), aboutMissionSection(), aboutValuesSection(), aboutTeamSection(), aboutApproachSection(), landingFooter()],
  });

const aboutHero = (): HTMLElement =>
  create("section", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "560px" : "520px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [
      image("images/founders.jpg", "LEA Organization team members", {
        position: "absolute",
        top: "0",
        right: "0",
        bottom: "0",
        left: currentBreakpoint === "desktop" ? "42%" : "0",
        width: currentBreakpoint === "desktop" ? "58%" : "100%",
        height: "100%",
        zIndex: "0",
        opacity: "1",
        objectFit: "contain",
        objectPosition: "right center",
        filter: "brightness(0.32) contrast(1.08)",
      }),
      create("div", {
        attrs: { "aria-hidden": "true" },
        style: {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          background: "linear-gradient(90deg, rgba(8,0,12,0.98) 0%, rgba(21,0,31,0.94) 46%, rgba(0,0,0,0.38) 72%, rgba(0,0,0,0.16) 100%)",
        },
      }),
      container(
        create("div", {
          style: {
            position: "relative",
            zIndex: "2",
            maxWidth: currentBreakpoint === "desktop" ? "820px" : "100%",
            padding: currentBreakpoint === "desktop" ? "34px 38px" : "26px",
            background: "rgba(21,0,31,0.72)",
            borderLeft: `5px solid ${theme.orange}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
          },
          children: [
            stack(
              18,
              eyebrow("About LEA Organization", { color: theme.orange }),
              heading("Opening access to technology, one learner at a time.", 1, {
                color: theme.white,
                maxWidth: currentBreakpoint === "desktop" ? "760px" : "100%",
                fontSize: currentBreakpoint === "desktop" ? "4rem" : "2.75rem",
                textShadow: "0 4px 22px rgba(0,0,0,0.48)",
              }),
              copy("We create practical coding experiences, mentorship, and community-led learning spaces for young people who deserve a fair path into technology.", {
                color: theme.white,
                maxWidth: "720px",
                fontWeight: "700",
                textShadow: "0 2px 12px rgba(0,0,0,0.48)",
              }),
              create("div", {
                style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" },
                children: [actionButton("/programs", "View Programs"), actionButton("/volunteer", "Join The Team", "outline")],
              })
            ),
          ],
        })
      ),
    ],
  });

const aboutMissionSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "88px 0" : "62px 0",
    container(
      stack(
        34,
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "0.95fr 1.05fr" : "1fr",
            gap: currentBreakpoint === "desktop" ? "48px" : "28px",
            alignItems: "center",
          },
          children: [
            aboutStoryCollage(),
            stack(
              16,
              eyebrow("Who We Are", { color: theme.orange }),
              heading("A community of builders, mentors, and learners.", 2, {
                fontSize: currentBreakpoint === "desktop" ? "2.65rem" : "2rem",
              }),
              copy("LEA Organization brings coding education closer to learners through schools, rescue centres, community projects, volunteers, and practical learning days."),
              copy("Our work is hands-on: learners do not only hear about technology, they use it to make projects, solve problems, present ideas, and build confidence."),
            ),
          ],
        }),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
            gap: "18px",
          },
          children: [
            aboutStatementCard("Mission", "To make practical technology education accessible to young learners and help them grow the confidence to create.", "target"),
            aboutStatementCard("Vision", "A generation of young people who can imagine, build, and participate meaningfully in the digital world.", "eye"),
            aboutStatementCard("Focus", "Learners aged 9 to 18, especially in communities where access to coding, devices, and mentorship can change real outcomes.", "focus"),
            aboutStatementCard("Method", "Project-based sessions, volunteer mentorship, community partnerships, and learning pathways that move from curiosity to real work.", "route"),
          ],
        })
      )
    )
  );

const aboutImagePanel = (src: string, alt: string, label: string, imageFilter = "none"): HTMLElement =>
  create("figure", {
    style: {
      position: "relative",
      minHeight: currentBreakpoint === "desktop" ? "430px" : "300px",
      margin: "0",
      overflow: "hidden",
      background: theme.plum,
      boxShadow: "0 20px 48px rgba(44,0,62,0.12)",
    },
    children: [
      image(src, alt, { position: "absolute", inset: "0", zIndex: "0", objectPosition: "center", filter: imageFilter }),
      create("figcaption", {
        text: label,
        style: {
          position: "absolute",
          left: "22px",
          bottom: "22px",
          zIndex: "1",
          padding: "10px 14px",
          background: theme.orange,
          color: theme.plum,
          fontWeight: "700",
        },
      }),
    ],
  });

const aboutStoryCollage = (): HTMLElement =>
  create("div", {
    style: {
      display: "grid",
      gridTemplateColumns: currentBreakpoint === "desktop" ? "1.7fr 1fr" : "1fr",
      gap: "14px",
      padding: "14px",
      background: theme.purple,
      boxShadow: "0 22px 52px rgba(44,0,62,0.16)",
    },
    children: [
      create("figure", {
        style: {
          position: "relative",
          minHeight: currentBreakpoint === "desktop" ? "500px" : "330px",
          margin: "0",
          overflow: "hidden",
          background: theme.plum,
        },
        children: [
          image("images/Happy.jpeg", "LEA learners smiling together", { position: "absolute", inset: "0", objectPosition: "center" }),
          create("figcaption", {
            style: {
              position: "absolute",
              left: currentBreakpoint === "desktop" ? "24px" : "16px",
              right: currentBreakpoint === "desktop" ? "24px" : "16px",
              bottom: currentBreakpoint === "desktop" ? "24px" : "16px",
              padding: currentBreakpoint === "desktop" ? "18px 22px" : "16px",
              background: theme.white,
              color: theme.ink,
              boxShadow: "0 16px 34px rgba(0,0,0,0.18)",
            },
            children: [
              stack(
                4,
                eyebrow("Story Frame One", { color: theme.orange }),
                heading("Learning starts with access.", 3, { color: theme.ink, fontSize: currentBreakpoint === "desktop" ? "1.55rem" : "1.32rem" })
              ),
            ],
          }),
        ],
      }),
      create("div", {
        style: {
          display: "grid",
          gridTemplateRows: currentBreakpoint === "desktop" ? "1fr 1fr" : "220px 220px",
          gap: "14px",
        },
        children: [
          collageImage("images/M2.jpeg", "LEA mentor supporting learners in a classroom"),
          collageImage("images/M7.jpeg", "LEA community learning moment"),
        ],
      }),
    ],
  });

const collageImage = (src: string, alt: string): HTMLElement =>
  create("figure", {
    style: {
      minHeight: currentBreakpoint === "desktop" ? "0" : "220px",
      margin: "0",
      overflow: "hidden",
      background: theme.plum,
    },
    children: [image(src, alt, { objectPosition: "center" })],
  });

const aboutStatementCard = (title: string, text: string, icon: AboutIcon): HTMLElement =>
  create("article", {
    style: {
      minHeight: "220px",
      display: "grid",
      alignContent: "start",
      gap: "14px",
      padding: "26px",
      background: theme.paper,
      border: `1px solid ${theme.line}`,
    },
    children: [
      create("div", {
        style: {
          width: "54px",
          height: "54px",
          display: "grid",
          placeItems: "center",
          background: theme.purple,
          border: `1px solid ${theme.purple}`,
        },
        children: [aboutIcon(icon, theme.orange)],
      }),
      heading(title, 3, { color: theme.purple, fontSize: "1.35rem" }),
      copy(text, { fontSize: "1rem" }),
    ],
  });

const aboutValuesSection = (): HTMLElement => {
  const values: AboutValue[] = [
    { title: "Access", text: "We bring technology learning closer to learners who may not otherwise get a fair chance to explore it." },
    { title: "Curiosity", text: "We protect the questions, experiments, and playful thinking that help young people become builders." },
    { title: "Mentorship", text: "We pair learning with guidance, encouragement, and relatable people already working in technology." },
    { title: "Community", text: "We work with schools, parents, volunteers, and partners because sustainable change is shared work." },
    { title: "Accountability", text: "We show up prepared, respect learner safety, and keep improving how sessions are delivered." },
  ];

  return section(
    theme.purple,
    currentBreakpoint === "desktop" ? "86px 0 94px" : "62px 0 70px",
    container(
      stack(
        34,
        stack(
          10,
          eyebrow("Our Values", { color: theme.orange }),
          heading("The standards behind the work.", 2, { color: theme.white }),
          copy("These values guide how we teach, partner, mentor, and design learner experiences.", { color: "#eadbed", maxWidth: "700px" })
        ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(5, minmax(0, 1fr))" : "1fr",
            gap: "14px",
          },
          children: values.map((value, index) => aboutValueCard(value, index)),
        })
      )
    )
  );
};

const aboutValueCard = (value: AboutValue, index: number): HTMLElement =>
  create("article", {
    style: {
      minHeight: currentBreakpoint === "desktop" ? "250px" : "auto",
      display: "grid",
      alignContent: "start",
      gap: "12px",
      padding: "24px",
      background: theme.paper,
      border: "1px solid rgba(255,255,255,0.18)",
      borderTop: `5px solid ${theme.orange}`,
      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.14)",
    },
    children: [
      create("span", {
        text: String(index + 1).padStart(2, "0"),
        style: {
          display: "inline-grid",
          placeItems: "center",
          width: "44px",
          height: "44px",
          background: theme.orange,
          color: theme.plum,
          fontSize: "0.95rem",
          fontWeight: "700",
          lineHeight: "1",
        },
      }),
      heading(value.title, 3, { color: theme.purple, fontSize: "1.28rem" }),
      copy(value.text, { color: theme.muted, fontSize: "0.96rem", lineHeight: "1.56" }),
    ],
  });

const aboutApproachSection = (): HTMLElement => {
  const steps = [
    ["Partner With Communities", "We identify schools, centres, and community projects where technology access can unlock new opportunity.", "images/M3.jpeg"],
    ["Teach Through Projects", "Learners build games, sites, app ideas, and challenge solutions instead of only listening to theory.", "images/LEA pics/coding16.jpg"],
    ["Mentor Beyond The Session", "Volunteers connect confidence, teamwork, presentation, and career imagination.", "images/M7.jpeg"],
  ] as const;

  return section(
    theme.purple,
    currentBreakpoint === "desktop" ? "86px 0 96px" : "62px 0 70px",
    container(
      stack(
        34,
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "minmax(0, 0.9fr) minmax(0, 1.1fr)" : "1fr",
            gap: currentBreakpoint === "desktop" ? "42px" : "24px",
            alignItems: "end",
          },
          children: [
            stack(
              14,
              eyebrow("How We Work", { color: theme.orange }),
              heading("A better rhythm for real learning.", 2, { color: theme.white, fontSize: currentBreakpoint === "desktop" ? "2.7rem" : "2rem" }),
              copy("We keep the model practical: partner well, teach through projects, and surround learners with mentors who help them keep building.", {
                maxWidth: "650px",
                color: "#eadbed",
              })
            ),
            aboutImagePanel("images/M1.jpeg", "LEA learners gathered during a program day", "Community learning"),
          ],
        }),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(3, minmax(0, 1fr))" : "1fr",
            gap: "18px",
          },
          children: steps.map(([title, text, src]) => aboutProcessCard(title, text, src)),
        })
      )
    )
  );
};

const aboutProcessCard = (title: string, text: string, src: string): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      gridTemplateRows: "190px minmax(0, 1fr)",
      overflow: "hidden",
      background: theme.paper,
      border: `1px solid ${theme.line}`,
      boxShadow: "0 16px 34px rgba(44, 0, 62, 0.08)",
    },
    children: [
      create("div", {
        style: { overflow: "hidden", background: theme.plum },
        children: [image(src, title, { objectPosition: "center" })],
      }),
      create("div", {
        style: { display: "grid", gap: "10px", alignContent: "start", padding: "24px" },
        children: [heading(title, 3, { color: theme.purple, fontSize: "1.32rem" }), copy(text, { fontSize: "1rem" })],
      }),
    ],
  });

const aboutTeamSection = (): HTMLElement =>
  section(
    theme.white,
    currentBreakpoint === "desktop" ? "86px 0 96px" : "62px 0 70px",
    container(
      stack(
        34,
        stack(
          10,
          eyebrow("Team", { color: theme.orange }),
          heading("The people helping LEA move.", 2, { color: theme.ink }),
          copy("Our core team combines software, community, operations, and communication experience to keep the mission grounded and growing.", {
            maxWidth: "760px",
            color: theme.muted,
          })
        ),
        create("div", {
          style: {
            display: "grid",
            gridTemplateColumns: currentBreakpoint === "desktop" ? "repeat(4, minmax(0, 1fr))" : "1fr",
            gap: "18px",
          },
          children: team.map((person) => aboutTeamCard(person)),
        })
      )
    )
  );

const aboutTeamCard = (person: Person): HTMLElement =>
  create("article", {
    style: {
      display: "grid",
      alignContent: "start",
      justifyItems: "center",
      gap: "16px",
      padding: currentBreakpoint === "desktop" ? "28px 20px 30px" : "28px 20px",
      background: theme.purple,
      border: `1px solid ${theme.purple}`,
      borderTop: `5px solid ${theme.orange}`,
      boxShadow: "0 18px 40px rgba(44, 0, 62, 0.15)",
      textAlign: "center",
    },
    children: [
      create("div", {
        style: {
          width: currentBreakpoint === "desktop" ? "184px" : "190px",
          height: currentBreakpoint === "desktop" ? "184px" : "190px",
          overflow: "hidden",
          borderRadius: "999px",
          background: theme.plum,
          border: `5px solid ${theme.orange}`,
          boxShadow: "0 0 0 5px rgba(255, 255, 255, 0.16), 0 18px 42px rgba(0,0,0,0.24)",
        },
        children: [image(person.image, person.name, { objectPosition: "center top" })],
      }),
      create("div", {
        style: { display: "grid", gap: "8px" },
        children: [
          stack(
            8,
            heading(person.name, 3, { color: theme.white, fontSize: "1.28rem" }),
            copy(person.role, { color: "#eadbed", fontSize: "0.96rem", lineHeight: "1.45" })
          ),
        ],
      }),
    ],
  });

const landingPage = (): HTMLElement =>
  create("main", {
    attrs: { "aria-label": "Landing page content" },
    style: { background: theme.paper },
    children: [landingHero(), missionCardsSection(), transformationSection(), landingActionsSection(), supportCollageSection(), landingFooter()],
  });

const applyDocumentBase = (): void => {
  document.title = "LEA Organization";
  document.documentElement.style.setProperty("scroll-behavior", "smooth");
  document.body.style.setProperty("margin", "0");
  document.body.style.setProperty("min-width", "320px");
  document.body.style.setProperty("background", theme.paper);
  document.body.style.setProperty("color", theme.ink);
  document.body.style.setProperty("font-family", '"Times New Roman", Times, serif');
  document.body.style.setProperty("font-size", "18px");
  document.body.style.setProperty("line-height", "1.6");
};

function render(): void {
  currentBreakpoint = breakpoint();
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;

  applyDocumentBase();
  const currentPage = pageFromPath();
  const content =
    currentPage === "home"
      ? landingPage()
      : currentPage === "about"
        ? aboutPage()
        : currentPage === "programs"
          ? programsPage()
          : currentPage === "projects"
          ? projectsPage()
          : currentPage === "events"
            ? eventsPage()
            : currentPage === "volunteer"
              ? volunteerPage()
              : currentPage === "contact"
                ? contactPage()
                : emptyPage();
  app.replaceChildren(header(currentPage), content);
  if (window.location.hash) {
    window.requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    });
  }
}

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    const next = breakpoint();
    if (next === currentBreakpoint) return;
    menuOpen = false;
    render();
  }, 120);
});

document.addEventListener("DOMContentLoaded", render);
window.addEventListener("hashchange", render);

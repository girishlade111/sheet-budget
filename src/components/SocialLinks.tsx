import { Instagram, Linkedin, Github, Codepen, Mail } from "lucide-react";

const links = {
  instagram: "https://www.instagram.com/girish_lade_/",
  linkedin: "https://www.linkedin.com/in/girish-lade-075bba201/",
  github: "https://github.com/girishlade111",
  codepen: "https://codepen.io/Girish-Lade-the-looper",
  email: "mailto:girishlade111@gmail.com",
};

export const SocialLinks = () => {
  const baseClasses =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="mr-1 hidden sm:inline">Connect with me</span>
      <a
        href={links.instagram}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Instagram profile"
        className={baseClasses}
      >
        <Instagram className="h-3.5 w-3.5" />
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="LinkedIn profile"
        className={baseClasses}
      >
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <a
        href={links.github}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="GitHub profile"
        className={baseClasses}
      >
        <Github className="h-3.5 w-3.5" />
      </a>
      <a
        href={links.codepen}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Codepen profile"
        className={baseClasses}
      >
        <Codepen className="h-3.5 w-3.5" />
      </a>
      <a
        href={links.email}
        aria-label="Send email to Girish Lade"
        className={baseClasses}
      >
        <Mail className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};

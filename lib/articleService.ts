import fs from "fs";
import path from "path";
import { Article } from "../types";
import {
  categoryConfigMap,
  defaultCategoryColor,
} from "../config/category";

const TEXTS_DIR = path.join(process.cwd(), "texts");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;

/* ── tiny YAML parser ────────────────────────────────────────────── */
function readYaml(block: string): Record<string, any> {
  const obj: Record<string, any> = {};
  block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [k, ...v] = line.split(":");
      if (!k || v.length === 0) return;
      const raw = v.join(":").trim();
      obj[k.trim()] =
        raw.startsWith("[") && raw.endsWith("]")
          ? raw
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : raw;
    });
  return obj;
}

function loadMd(full: string) {
  const raw = fs.readFileSync(full, "utf8").trim();
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      return {
        yaml: readYaml(raw.slice(3, end).trim()),
        body: raw.slice(end + 4).trim(),
      };
    }
  }
  return { yaml: {}, body: raw };
}

/* ── main ─────────────────────────────────────────────────────────── */
export function getArticleData(): {
  articles: Article[];
  categories: { name: string; color: string }[];
} {
  const articles: Article[] = [];

  const categoryFolders = fs
    .readdirSync(TEXTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const categories = categoryFolders.map((cat) => ({
    name: cat,
    color: categoryConfigMap[cat]?.color || defaultCategoryColor,
  }));

  for (const cat of categoryFolders) {
    const catDir = path.join(TEXTS_DIR, cat);

    /* every sub-folder is an article */
    fs.readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .forEach((d) => {
        const slug = d.name;
        const artDir = path.join(catDir, slug);

        /* choose markdown file: prefer <slug>.md else first .md */
        const mdFiles = fs
          .readdirSync(artDir)
          .filter((f) => f.endsWith(".md"));
        if (mdFiles.length === 0) return;

        const mdFile =
          mdFiles.find((f) => f === `${slug}.md`) ?? mdFiles[0];
        const mdPath = path.join(artDir, mdFile);

        const { yaml, body } = loadMd(mdPath);

        const title =
          yaml.title ||
          (body.startsWith("#")
            ? body.split("\n")[0].replace(/^#+\s*/, "")
            : slug);
        const date = yaml.date || "Unknown Date";
        const author = yaml.author || "Unknown Author";
        const headerImage = yaml["header-image"] || "";

        const preview = body.replace(/^#.*?\n/, "").slice(0, 180) + "...";

        /* media = yaml.media + every image file in folder */
        const yamlMedia = Array.isArray(yaml.media) ? yaml.media : [];
        const dirImages = fs
          .readdirSync(artDir)
          .filter((f) => IMAGE_EXT.test(f))
          .map((f) => path.join("/texts", cat, slug, f));

        const media = [...new Set([...yamlMedia, ...dirImages])];

        articles.push({
          title,
          slug,
          category: cat,
          date,
          author,
          preview,
          media,
          headerImage,
        });
      });
  }

  return { articles, categories };
}


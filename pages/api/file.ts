import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { cat, slug } = req.query;
  if (typeof cat !== "string" || typeof slug !== "string") return res.status(400).end();

  const dir = path.join(process.cwd(), "texts", cat, slug);
  if (!fs.existsSync(dir)) return res.status(404).end();

  let md = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(md)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
    if (files.length === 0) return res.status(404).end();
    md = path.join(dir, files[0]);
  }
  res.status(200).send(fs.readFileSync(md, "utf8"));
}

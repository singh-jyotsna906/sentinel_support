import express from 'express';
import prisma from '../prisma.ts';

const router = express.Router();

// GET /api/kb/search?q=
router.get('/search', async (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) {
    return res.json({ results: [] });
  }
  // Simple search: match title or content_text
  const docs = await prisma.kbDoc.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { content_text: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 10
  });
  const results = docs.map((doc: { id: any; title: any; anchor: any; content_text: string | any[]; }) => ({
    docId: doc.id,
    title: doc.title,
    anchor: doc.anchor,
    extract: doc.content_text.slice(0, 200)
  }));
  res.json({ results });
});

export default router;

import z from 'zod'
import { publicProcedure, router } from '../trpc'
import  prisma  from '@/lib/prisma'

const postSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
})

export const postRouter = router({

    getPost: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return await prisma.post.findUnique({
      where: { id: parseInt(input.id) },
    })
  }),

  getPosts: publicProcedure.query(async () => {
    return await prisma.post.findMany()
  }),
   createPosts: publicProcedure.input(postSchema).mutation(async ({ input }) => {
    return await prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        authorId: input.authorId,
      },
    })
  }),
})

export type PostRouter = typeof postRouter
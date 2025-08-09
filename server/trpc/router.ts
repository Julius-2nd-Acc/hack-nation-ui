import { router as createRouter } from '../../app/server/trpc';
import { pythonRouter } from '../../app/server/routers/python';
import { postRouter } from '@/app/server/routers/posts';

export const appRouter = createRouter({
	python: pythonRouter,
	post: postRouter
});

export type AppRouter = typeof appRouter;

import { router as createRouter } from '../../app/server/trpc';
import { pythonRouter } from '../../app/server/routers/python';

export const appRouter = createRouter({
	python: pythonRouter,

});

export type AppRouter = typeof appRouter;

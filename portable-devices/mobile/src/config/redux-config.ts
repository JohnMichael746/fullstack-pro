import storage from '@react-native-async-storage/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createEpicMiddleware } from 'redux-observable';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createReduxStore as createBaseReduxStore } from './base-redux-config';
import modules, { logger } from '../modules';
import { rootEpic } from './epic-config';
import history from './router-history';
import { createClientContainer } from './client.service';

export { history };
const { apolloClient, container, services } = createClientContainer();

export const epicMiddleware = createEpicMiddleware({
    dependencies: {
        apolloClient,
        routes: modules.getConfiguredRoutes(),
        services,
        container,
        logger,
    },
});

export const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
    transforms: modules.reduxPersistStateTransformers,
};

/**
 * Add any reducers required for this app dirctly in to
 * `combineReducers`
 */
export const createReduxStore = () => {
    // middleware
    const router = connectRouter(history);

    const store = createBaseReduxStore({
        scope: 'browser',
        isDebug: __DEBUGGING__,
        isDev: process.env.NODE_ENV === 'development',
        initialState: {},
        persistConfig,
        middleware: [routerMiddleware(history)],
        epicMiddleware,
        rootEpic: rootEpic as any,
        reducers: { router, ...modules.reducers },
    });
    container.bind('ReduxStore').toConstantValue(store);

    return store;
};

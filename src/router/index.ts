/* eslint-disable */
import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import { useAuthStore } from "@/store/auth";
import { ElMessage } from "element-plus";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/', redirect: '/login'
    },
    {
        // path: "/home/:Authorization/:account", // 定义动态路由
        path: "/home",
        name: "home",
        component: () => import("@/views/main/HomePage.vue"),
        // props: route => ({
        //     Authorization: route.params.Authorization,
        //     account: route.params.account,
        // }),
    },
    {
        path: "/editor",
        name: "editor",
        component: () => import("@/views/main/EditorPage.vue"),
    },
    {
        path: "/picture",
        name: "picture",
        component: () => import("@/views/main/PicturePage.vue"),
    },
    {
        path: "/todo",
        name: "todo",
        component: () => import("@/views/main/TodoPage.vue"),
    },
    {
        path: "/note",
        name: "note",
        component: () => import("@/views/main/NotePage.vue"),
    },
    {
        path: "/setting",
        name: "setting",
        component: () => import("@/views/main/SettingPage.vue"),
    },
    {
        path: "/register",
        name: "register",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "about" */ "@/views/login/RegisterPage.vue"),
    },
    {
        path: "/login",
        name: "login",
        component: () =>
          import(/* webpackChunkName: "about" */ "@/views/login/LoginPage.vue"),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // 修复：直接使用计算属性，不需要 .value
    const isAuthenticated = authStore.isAuthenticated;

    // 白名单页面
    const publicPages = ['login', 'register'];
    const isPublicPage = publicPages.includes(to.name as string);

    // 1. 已登录用户访问登录/注册页 -> 重定向到首页
    if (isAuthenticated && isPublicPage) {
        return next({ name: 'home' });
    }

    // 2. 未登录用户访问非公共页面 -> 重定向到登录页
    if (!isAuthenticated && !isPublicPage) {
        // 仅在不是从登录页重定向时才显示提示
        if (from.name !== 'login') {
            setTimeout(() => {
                ElMessage.warning('请先登录');
            }, 10);
        }
        return next({ name: 'login' });
    }

    // 3. 其他情况正常放行
    next();
});
export default router;

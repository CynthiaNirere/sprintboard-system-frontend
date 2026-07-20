import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/admin/shows",
      name: "adminShows",
      component: () => import("./views/AdminShows.vue"),
    },
    {
      path: "/admin/events",
      name: "adminEvents",
      component: () => import("./views/AdminEvents.vue"),
    },
    {
      path: "/admin/users",
      name: "adminUsers",
      component: () => import("./views/AdminUsers.vue"),
    },
    {
      path: "/shows",
      name: "shows",
      component: () => import("./views/ShowList.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("./views/Profile.vue"),
    },
    {
      path: "/admin",
      name: "adminLayout",
      component: () => import("./components/AdminLayout.vue"),
     redirect: { name: "overview" },
     beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.globalRole === "ADMIN") next();
        else next({ name: "userOverview" });
      },
      children: [
        {
          path: "storyboard",
          name: "adminOverview",
          component: () => import("./views/StoryboardAdmin.vue"),
        },
        {
          path: "projects",
          name: "adminProjects",
          component: () => import("./views/ProjectsView.vue"),
        },
        {
          path: "projects/:id",
          name: "adminProject",
          component: () => import("./views/ProjectsView.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("./views/Profile.vue"),
        },
        {
          path: "backlog",
          name: "backlog",
          component: () => import("./views/BacklogView.vue"),
        },
        {
          path: "sprints",
          name: "adminSprints",
          component: () => import("./views/Sprints.vue"),
        },
      ]
    },
    {
      path: "/user",
      name: "userLayout",
      component: () => import("./components/UserLayout.vue"),
      redirect: { name: "userOverview" },
      children: [
        {
          path: "storyboard",
          name: "userOverview",
          component: () => import("./views/Storyboard.vue"),
        },
        {
          path: "projects",
          name: "myProjects",
          component: () => import("./views/MyProjects.vue"),
        },
        {
          path: "profile",
          name: "userProfile",
          component: () => import("./views/Profile.vue"),
        },
        {
          path: "backlog",
          name: "userBacklog",
          component: () => import("./views/BacklogView.vue"),
        },
        {
          path: "sprints",
          name: "sprints",
          component: () => import("./views/Sprints.vue"),
        },
      ]
    },
    {
      path: "/project-admin/:id",
      name: "projectAdminLayout",
      component: () => import("./components/ProjectAdminLayout.vue"),
      children: [
        {
          path: "storyboard",
          name: "projectAdminOverview",
          component: () => import("./views/Storyboard.vue"),
        },
        {
          path: "sprints",
          name: "projectAdminSprints",
          component: () => import("./views/Sprints.vue")
        }
      ],
    }
],
});

router.beforeEach((to, from, next) => {
  if (to.path.startsWith("/admin")) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.globalRole !== "ADMIN") return next({ name: "userOverview" });
  }
  next();
});

export default router;
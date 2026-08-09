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
      path: "/profile",
      name: "profile",
      component: () => import("./views/Profile.vue"),
    },
     // ADMIN — global admins (user.globalRole === "ADMIN")
    {
      path: "/admin",
      name: "adminLayout",
      component: () => import("./components/AdminLayout.vue"),
      redirect: { name: "adminOverview" },
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
          path: "sprints",
          name: "adminSprints",
          component: () => import("./views/Sprints.vue"),
        },
        {
          path: "backlog",
          name: "backlog",
          component: () => import("./views/BacklogView.vue"),
        },
        {
          path: "team-management",
          name: "teamManagement",
          component: () => import("./views/TeamManagement.vue"),
        },
        {
          path: "board-statuses",
          name: "boardStatuses",
          component: () => import("./views/BoardStatuses.vue"),
        },
        {
          path: "github-integrations",
          name: "adminGithub",
          component: () => import("./views/GithubIntegrations.vue"),
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
          path: "users",
          name: "users",
          component: () => import("./views/Users.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("./views/Profile.vue"),
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
          path: "sprints",
          name: "sprints",
          component: () => import("./views/Sprints.vue"),
        },
        {
          path: "backlog",
          name: "userBacklog",
          component: () => import("./views/BacklogView.vue"),
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
      ]
    },
     // PROJECT-ADMIN — one specific project
    {
      path: "/project-admin/:id",
      name: "projectAdminLayout",
      component: () => import("./components/ProjectAdminLayout.vue"),
      redirect: { name: "projectAdminOverview" },
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
        },
        {
          path: "backlog",
          name: "projectAdminBacklog",
          component: () => import("./views/BacklogView.vue")
        },
        {
          path: "team-management",
          name: "projectAdminTeamManagement",
          component: () => import("./views/TeamManagement.vue"),
        },
        {
          path: "github-integrations",
          name: "projectAdminGithub",
          component: () => import("./views/GithubIntegrations.vue"),
        },
        {
          path: "board-statuses",
          name: "projectAdminBoardStatuses",
          component: () => import("./views/BoardStatuses.vue"),
        },
      ],
    },
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
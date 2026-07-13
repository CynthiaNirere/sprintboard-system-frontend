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
      path: "/admin/seats",
      name: "adminSeats",
      component: () => import("./views/AdminSeats.vue"),
    },
    {
      path: "/admin/users",
      name: "adminUsers",
      component: () => import("./views/AdminUsers.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("./views/Home.vue"),
    },
    {
      path: "/shows",
      name: "shows",
      component: () => import("./views/ShowList.vue"),
    },
    {
      path: "/shows/:id/events",
      name: "eventList",
      component: () => import("./views/EventList.vue"),
    },
    {
      path: "/events",
      name: "events",
      component: () => import("./views/AllEvents.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("./views/Ticket.vue"),
    },
    {
      path: "/admin",
      name: "adminLayout",
      component: () => import("./components/AdminLayout.vue"),
    },
    {
      path: "/admin/overview",
      name: "overview",
      component: () => import("./views/Overview.vue"),
    },
    {
      path: "/admin/dashboard",
      name: "adminDashboard",
      component: () => import("./views/AdminDashboard.vue"),
    },
    // {
    //   path: "/admin/projects",
    //   name: "projects",
    //   component: () => import("./views/Projects.vue"),
    // },
    // {
    //   path: "/admin/sprints",
    //   name: "activeSprints",
    //   component: () => import("./views/ActiveSprints.vue"),
    // },
    // {
    //   path: "/admin/team",
    //   name: "teamManagement",
    //   component: () => import("./views/TeamManagement.vue"),
    // },
    // {
    //   path: "/admin/github",
    //   name: "githubIntegrations",
    //   component: () => import("./views/GithubIntegrations.vue"),
    // },
    // {
    //   path: "/admin/settings",
    //   name: "globalSettings",
    //   component: () => import("./views/GlobalSettings.vue"),
    // },
    {
      path: "/shows/:id/events/:eventId/seatmap",
      name: "seatmap",
      component: () => import("./views/SeatMap.vue"),
    },
    {
      path: "/admin/reports",
      name: "adminReports",
      component: () => import("./views/AdminReports.vue"),
    },
    {
      path: "/shows/:id/events/:eventId/booking",
      name: "booking",
      component: () => import("./views/Booking.vue"),
    },
    {
      path: "/refund/:paymentId",
      name: "requestRefund",
      component: () => import("./views/Refund.vue"),
      props: true,
    },
    {
      path: "/admin/refunds",
      name: "adminRefunds",
      component: () => import("./views/AdminRefunds.vue"),
    },
    {
      path: "/shows/:id/events/:eventId/payment",
      name: "payment",
      component: () => import("./views/Payment.vue"),
    },
    {
      path: "/shows/:id/events/:eventId/confirmation",
      name: "confirmation",
      component: () => import("./views/Confirmation.vue"),
    },
    {
  path: "/projects",
  name: "projects",
  component: () => import("./views/ProjectsView.vue"),
},
{
  path: "/projects/:id",
  name: "project",
  component: () => import("./views/ProjectsView.vue"),
},
{
  path: "/my-projects",
  name: "userProjects",
  component: () => import("./views/UserProject.vue"),
},
],
});

export default router;
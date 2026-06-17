<template>
  <RouterView />
</template>

<script lang="ts" setup>
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";
import { defineAsyncComponent } from "vue";
import { getCurrentInstance } from "vue";
import type { _p_TYP, _pp_TYP } from "../shared/types";

import DashboardView     from "./src/views/DashboardView.vue";
import CatalogSyncView   from "./src/views/CatalogSyncView.vue";

const SellerInstagramConnect = defineAsyncComponent(() => import("./src/views/SellerInstagramConnect.vue"));

const { _p, _pp } = defineProps<{ _p: _p_TYP; _pp: _pp_TYP }>();

const app = getCurrentInstance()!.appContext.app;

app.use(createPinia());

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/",              redirect: "/seller-connect" },
    { path: "/seller-connect", component: SellerInstagramConnect },
    { path: "/dashboard",      component: DashboardView },
    { path: "/catalog-sync",   component: CatalogSyncView },
  ],
});
app.use(router);

_p.my["emitter"] = _p.f.new_emitter();
</script>

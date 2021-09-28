<template>
  <v-container>
    <v-row>
      <AdminDashboardCard
        imageUrl="/img/Hospitals.jpg"
        title="Hospitals"
        entityUrl="/hospitals"
      ></AdminDashboardCard>

      <AdminDashboardCard
        imageUrl="/img/doctor.jpg"
        title="Doctors"
        entityUrl="/doctors"
      ></AdminDashboardCard>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src

import AdminDashboardCard from '@/components/base/AdminDashboardCard'

export default {
  name: "Home",
  components: {
    AdminDashboardCard
  },
};
</script>

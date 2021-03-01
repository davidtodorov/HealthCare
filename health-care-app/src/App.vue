<template>
	<v-app id="inspire">
		<v-navigation-drawer v-model="drawer" app>
			<v-card class="mx-auto" max-width="500">
				<v-list>
					<v-list-item-group>
						<v-list-item
							v-for="(item, i) in items"
							:key="i"
							:to="item.to"
						>
							<v-list-item-icon>
								<v-icon v-text="item.icon"></v-icon>
							</v-list-item-icon>
							<v-list-item-content>
								<v-list-item-title
									v-text="item.text"
								></v-list-item-title>
							</v-list-item-content>
						</v-list-item>
					</v-list-item-group>
				</v-list>
			</v-card>
		</v-navigation-drawer>

		<v-app-bar app>
			<v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

			<v-toolbar-title>{{ url }}</v-toolbar-title>
		</v-app-bar>

		<v-main>
			<router-view />
		</v-main>
	</v-app>
</template>

<script>
// import Login from './components/authentication/Login';
// import Register from './components/authentication/Register';

export default {
	name: "App",

	components: {
		// Login,
		// Register
	},

	data: () => ({
		drawer: null,
		items: [
			{
				icon: "mdi-inbox",
				text: "Home",
				to: "/home",
			},
			{
				icon: "mdi-inbox",
				text: "Lgoin",
				to: "/login",
			},
			{
				icon: "mdi-star",
				text: "Register",
				to: "/register",
			},
		],
		url: process.env
	}),
	
};
</script>

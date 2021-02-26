<template>
	<AppAuthenticationForm title="Login" :submitHandler="submitLogin" :allFieldsAreValid="true">
		<v-form>
			<v-text-field 
				label="Username" 
				name="username" 
				type="text" 
				color="#232323" 
				v-model="username" 
			/>

			<v-text-field
				id="password"
				label="Password"
				name="password"
				type="password"
				color="#232323"
				v-model="password"
			/>
			<v-alert v-if="errorMessage" icon="far fa-user" color="red" text outlined>{{errorMessage}}</v-alert>
		</v-form>
	</AppAuthenticationForm>
</template>

<script>
import AppAuthenticationForm from "./AuthenticationForm";

export default {
	components: {
		AppAuthenticationForm
	},
	data: () => {
		return {
			username: "",
			password: "",
			errorMessage: ""
		};
	},
	methods: {
		submitLogin() {
			this.$store
				.dispatch("user/login", {
					username: this.username,
					password: this.password
				})
				// .then(() => {
				// 	this.$router.push({ name: "ProductList" });
				// })
				.catch(err => {
					this.errorMessage = err.response.data;
				});
		}
	},
};
</script>
<template>
	<AppAuthenticationForm
		title="Register"
		:submitHandler="submitRegister"
		:allFieldsAreValid="fieldsAreValid"
	>
		<v-form>
			<v-text-field
				label="Eamil"
				name="email"
				type="text"
				color="#232323"
				v-model="email"
				@blur="$v.email.$touch"
				:error-messages="emailErrors"
			/>

			<v-text-field
				label="Username"
				name="username"
				type="text"
				color="#232323"
				v-model="username"
				@blur="$v.username.$touch"
				:error-messages="usernameErrors"
			/>

			<v-text-field
				label="First Name"
				name="firstName"
				type="text"
				color="#232323"
				v-model="firstName"
				@blur="$v.firstName.$touch"
				:error-messages="firstNameErrors"
			/>

			<v-text-field
				label="Last Name"
				name="lastName"
				type="text"
				color="#232323"
				v-model="lastName"
				@blur="$v.lastName.$touch"
				:error-messages="lastNameErrors"
			/>

			<v-text-field
				id="password"
				label="Password"
				name="password"
				type="password"
				color="#232323"
				v-model="password"
				@blur="$v.password.$touch"
				:error-messages="passwordErrors"
			/>

			<v-text-field
				id="confirmPassword"
				label="Confirm Password"
				name="password"
				type="password"
				color="#232323"
				v-model="confirmPassword"
				@input="$v.confirmPassword.$touch"
				:error-messages="confirmPasswordErrors"
			/>

			<v-alert v-if="errorMessage" icon="far fa-user" color="red" text outlined>{{errorMessage}}</v-alert>
		</v-form>
	</AppAuthenticationForm>
</template>

<script>
import AppAuthenticationForm from "./AuthenticationForm";
import { validationMixin } from "vuelidate";
import { required, email, sameAs, minLength } from "vuelidate/lib/validators";

export default {
	components: {
		AppAuthenticationForm
	},
	mixins: [validationMixin],
	data: () => {
		return {
			email: "",
			username: "",
			firstName: "",
			lastName: "",
			password: "",
			confirmPassword: "",
			errorMessage: ""
		};
	},
	validations: {
		email: {
			required,
			email
		},
		firstName: { required },
		lastName: { required },
		username: {
			required,
			minLength: minLength(4)
		},
		password: {
			required,
			minLength: minLength(3)
		},
		confirmPassword: {
			sameAs: sameAs("password")
		}
	},
	computed: {
		fieldsAreValid() {
			return (
				!this.$v.$anyError &&
				!!this.email &&
				!!this.firstName &&
				!!this.lastName &&
				!!this.username &&
				!!this.password &&
				!!this.confirmPassword
			);
		},
		emailErrors() {
			const errors = [];
			if (!this.$v.email.$dirty) return errors;
			!this.$v.email.email && errors.push("Must be valid e-mail");
			!this.$v.email.required && errors.push("E-mail is required");
			return errors;
		},
		usernameErrors() {
			const errors = [];
			if (!this.$v.username.$dirty) return errors;
			!this.$v.username.required && errors.push("Username is required");
			!this.$v.username.minLength &&
				errors.push("The minimal length must be 4 symbols");
			return errors;
		},
		firstNameErrors() {
			const errors = [];
			if (!this.$v.firstName.$dirty) return errors;
			!this.$v.firstName.required && errors.push("First Name is required");
			return errors;
		},
		lastNameErrors() {
			const errors = [];
			if (!this.$v.lastName.$dirty) return errors;
			!this.$v.lastName.required && errors.push("Last Name is required");
			return errors;
		},
		passwordErrors() {
			const errors = [];
			if (!this.$v.password.$dirty) return errors;
			!this.$v.password.minLength &&
				errors.push("The minimal length must be 6 symbols");
			!this.$v.password.required && errors.push("Password is required");
			return errors;
		},
		confirmPasswordErrors() {
			const errors = [];
			if (!this.$v.confirmPassword.$dirty) return errors;
			!this.$v.confirmPassword.sameAs &&
				errors.push("The passwords should match");
			return errors;
		}
	},
	methods: {
		submitRegister() {
			this.$store
				.dispatch("user/register", {
					email: this.email,
					username: this.username,
					firstName: this.firstName,
					lastName: this.lastName,
					password: this.password
				})
				.then(res => {
					console.log(res);
					this.$router.push({ name: "Home" });
				})
				.catch(err => {
					this.errorMessage = err.response.data;
				});
		}
	}
};
</script>
<template>
	<v-container class="fill-height" fluid>
		<v-row align="center" justify="center">
			<v-col cols="12" sm="8" md="4">
				<v-card class="elevation-12">
					<v-toolbar color="#22AA94" dark flat>
						<v-toolbar-title>{{title}}</v-toolbar-title>
						<v-spacer />
					</v-toolbar>
					<v-card-text>
						<slot></slot>
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn 
							color="#22AA94" 
							class="white--text"
							:disabled=!allFieldsAreValid
							@click="submit"
						>{{title}}</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
export default {
	props: {
		title: {
			type: String,
			requred: true
		},
		submitHandler: {
			type: Function,
			required: true
		},
		allFieldsAreValid: {
			type: Boolean,
			required: true
		}
	},
	methods:{
		submit() {
			this.submitHandler()
		}
	}
};
</script>
<script setup>
import { onMounted } from "vue";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);
const visible = ref(false);
const firstPasswordVisible = ref(false);
const secondPasswordVisible = ref(false);
const buttonClass = ref('button-style');
const sectionHeader = ref('section-header');
const inputLabels = ref('input-labels');
const info = ref('info-box');
const red = ref('red-text');
const form = ref(null);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const user = ref({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  globalRole: "",
  githubAccount: ""
});

const accountPasswords = ref({
  firstPassword: "",
  secondPassword: "",
})

const checkRequired = ((value) => {
  if (value) return true;
  return "This field is required.";
});

const checkEmail = ((value) => {
  if (/.+@.+\..+/.test(value)) return true;
  return "E-mail must be valid.";
});

const checkPassword = ((value) => {
  if (value?.length >= 8 ) return true;
  return "Password must be at least 8 characters."
})

const checkMatch = ((value) => {
  if (value === accountPasswords.value.firstPassword) return true;
  return "Passwords do not match.";
});

const requiredRules = [ checkRequired ];

const emailRules = [ checkRequired, checkEmail ];

const passwordRules = [ checkRequired, checkPassword ];

const matchRules = [ checkRequired, checkMatch ];

onMounted(async () => {
  localStorage.removeItem("user");
});

async function createAccount() {
  const validation = await form.value.validate();
  if (validation.valid) {
    user.value.password = accountPasswords.value.secondPassword;
    await UserServices.addUser(user.value)
      .then((data) => {
        window.localStorage.setItem("user", JSON.stringify(data.data));
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "Account created successfully!";
        router.push({ name: "home" });
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}

async function login() {
  await UserServices.loginUser(user)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Login successful!";
      console.log("userType:", data.data.globalRole);
      if (data.data.globalRole === "ADMIN") {
        router.push({ name: "adminLayout" }).catch(err => console.log("Nav error:", err));;
      } 
      else {router.push({ name: "home" });}
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function continueAsGuest() {
  router.push({ name: "home" });
}

function openCreateAccount() {
  isCreateAccount.value = true;
}

function closeCreateAccount() {
  form.value.reset();
  isCreateAccount.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center">
      <v-col cols="6">
        <v-card class="rounded-lg elevation-5 px-8">
        
          <v-card-title class="headline my-4 text-center">
            Welcome to Planetarium
          </v-card-title>
               
          <v-card-text>
            <div class="text-body-large text-large-emphasis mb-1">Email</div>
            <v-text-field
              v-model="user.email"
              density="compact"
              placeholder="jane.doe@gmail.com"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              required
            ></v-text-field>
    
            <div class="text-body-large text-large-emphasis mb-1">Password</div>
            <v-text-field
                v-model="user.password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                placeholder="abc123"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                @click:append-inner="visible = !visible"
                required
            ></v-text-field>
            
            <div id="buttonWrapper" class="d-flex align-center flex-column mt-4 mb-2">
              <v-btn :class="buttonClass" color="primary" @click="login()">Log In</v-btn>
              <v-container class="my-2">
                <v-divider>or</v-divider>              
              </v-container>
              <v-btn class="mb-2" :class="buttonClass" color="primary" variant="tonal" @click="openCreateAccount()">Create New Account</v-btn>
              <v-btn class="my-2" :class="buttonClass" variant="outlined" @click="continueAsGuest()">Continue as Guest</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
      
    <v-dialog persistent v-model="isCreateAccount" width="800">
      <v-card class="rounded-lg elevation-5">
        <v-toolbar color="primary">
          <v-toolbar-title>
            Create Your Account
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon @click="closeCreateAccount()">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
    
        <v-form ref="form">
          <v-card-text>
            <v-alert :class="info">
              Create an account to save your tickets, manage bookings,
              and get exclusive updates!
            </v-alert>
      
            <div class="mt-4" :class="sectionHeader">Personal Information</div>
            <v-row>
              <v-col>
                <div class="text-body-medium text-large-emphasis mb-1" :class="inputLabels">First Name <span :class="red">*</span></div>
                <v-text-field
                  v-model="user.firstName"
                  :rules="requiredRules"
                  density="compact"
                  placeholder="Jane"
                  required
                  variant="outlined"
                >
                </v-text-field>
              </v-col>
              <v-col>
                 <div class="text-body-large text-large-emphasis mb-1" :class="inputLabels">Last Name <span :class="red">*</span></div>
                <v-text-field
                  v-model="user.lastName"
                  :rules="requiredRules"
                  density="compact"
                  placeholder="Doe"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
      
            <v-container class="pt-1">
              <v-divider></v-divider>
            </v-container>
      
            <div :class="sectionHeader">Contact Information</div>
            <div class="text-body-large text-large-emphasis mb-1" :class="inputLabels">Email Address <span :class="red">*</span></div>
            <v-text-field
              v-model="user.email"
              :rules="emailRules"
              density="compact"
              placeholder="jane.doe@example.com"
              required
              variant="outlined"
              hint="You'll use this to log in and receive tickets"
              persistent-hint
            ></v-text-field>
  
            <div class="text-body-large text-large-emphasis mb-1 mt-3" :class="inputLabels">Phone Number</div>
            <v-text-field
              v-model="user.phoneNumber"
              density="compact"
              placeholder="(999) 999-9999"
              variant="outlined"
              hint="Optional - for booking confirmations"
              persistent-hint
            ></v-text-field>
  
            <v-container class="pt-4">
              <v-divider></v-divider>
            </v-container>
  
            <div :class="sectionHeader">Account Security</div>
            <div class="text-body-large text-large-emphasis mb-1" :class="inputLabels">Password <span :class="red">*</span></div>
            <v-text-field
              v-model="accountPasswords.firstPassword"
              :append-inner-icon="firstPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="firstPasswordVisible ? 'text' : 'password'"
              :rules="passwordRules"
              @click:append-inner="firstPasswordVisible = !firstPasswordVisible"
              density="compact"
              variant="outlined"
              placeholder="abc123456"
              required
            ></v-text-field>
  
            <div class="text-body-large text-large-emphasis mb-1 mt-3" :class="inputLabels">Confirm Password <span :class="red">*</span></div>
            <v-text-field
              v-model="accountPasswords.secondPassword"
              :append-inner-icon="secondPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="secondPasswordVisible ? 'text' : 'password'"
              :rules="matchRules"
              @click:append-inner="secondPasswordVisible = !secondPasswordVisible"
              density="compact"
              variant="outlined"
              placeholder="abc123456"
              required
            ></v-text-field>
          </v-card-text>
          
          <v-card-actions class="bg-grey-lighten-4 py-4">
            <v-spacer></v-spacer>
            <v-btn
            class="px-4"
            variant="outlined"
            color="primary"
            @click="closeCreateAccount()"
            >Cancel</v-btn
            >
            <v-btn 
            variant="flat"
            color="primary"
            class="px-6"
            @click="createAccount()"
            >Create Account & Continue</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
      
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      
      <template v-slot:actions>
        <v-btn
          :color="snackbar.color"
          variant="text"
          @click="closeSnackBar()"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.button-style {
  width: 48%;
}
.red-text {
  color: red;
}
.info-box {
  background-color: rgba(187, 222, 251, .3);
  border: 1px solid lightblue;
  color: rgb(23, 100, 215);
  padding: 0.7rem 1rem;
}
.section-header {
  margin-bottom: 0.6rem;
  font-weight: 500;
}
.input-labels {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
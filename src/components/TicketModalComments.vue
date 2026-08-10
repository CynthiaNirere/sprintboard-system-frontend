<script setup>
import { onMounted, defineProps, defineEmits, ref, computed } from "vue";
import TicketServices from "../services/TicketServices";
import CommentServices from "../services/CommentServices.js";
import UserServices from "../services/UserServices";
import { Mentionable } from 'vue-mention';
import 'floating-vue/dist/style.css';

const user = ref(null);
const comments = ref([]);
const props = defineProps(['ticket', 'snackbar', 'projectMembers']);
const emit = defineEmits(["modal-close", 'comment-count-changed']);
const addComment = ref(false);

const newComment = ref({
  content: "",
  ticketId: null,
  userId: null
});

const mentionItems = computed(() => {
  if (!props.projectMembers) {
    return [];
  }
  return props.projectMembers.map(member => ({
    ...member,
    value: `${member.firstName} ${member.lastName}`
  }))
})

async function getComments() {
  await CommentServices.getCommentsForTicket(props.ticket.id)
    .then((response) => {
      comments.value = response.data;

      emit('comment-count-changed', comments.value.length);
    })
    .catch((error) => {
      console.log(error);
      comments.value = [];
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || `Error loading comments for ticket ${props.ticket.title}`;
    });
}

async function addNewComment() {
  if (!newComment.value.content) {
    props.snackbar.value = true;
    props.snackbar.color = "error";
    props.snackbar.text = "Comment text is required.";
    return;   
  }
  
  newComment.value.ticketId = props.ticket.id;
  newComment.value.userId = user.value.id;

  await CommentServices.addComment(newComment.value)
    .then(async (response) => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = "Comment added successfully!";

      newComment.value.content = "";
      newComment.value.ticketId = null;
      newComment.value.userId = null;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response?.data?.message || "Error adding comment.";
    });

  await getComments();
}

function formatLogTime(loggedTime) {
  const now = new Date();
  const createdAt = new Date(loggedTime);
  const secondsDifference = Math.floor((now - createdAt) / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);
  
  if (secondsDifference < 60) {
    return "Just now";
  }
  else if (minutesDifference < 60) {
    return `${minutesDifference} min ago`
  }
  else if (hoursDifference < 24) {
    return `${hoursDifference} hr ago`
  }
  else {
    return daysDifference === 1 ? "1 day ago" : `${daysDifference} days ago`
  }
}

function getAuthorFullName(userId) {
  const member = props.projectMembers?.find(member => member.id === userId);
  return member ? `${member.firstName} ${member.lastName}` : "Unknown User";
}

function getAuthorInitials(userId) {
  const member = props.projectMembers?.find(member => member.id === userId);
  return member ? `${member.firstName.charAt(0)} ${member.lastName.charAt(0)}` : "U";
}

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getComments();
});
</script>

<template>
  <div class="modal-content">
    <div v-if="comments.length > 0">
      <div v-for="comment in comments" :key="comment.id" class="mb-3 pb-2" style="border-bottom: 1px solid #EFEFEF">
        <div class="d-flex justify-start ga-4">
          <div class="mt-1">
            <v-avatar class="mx-auto text-center avatar-outline" color="#1740E3" size="x-small" style="letter-spacing:-7%;">
              <span style="font-size: 10px;">{{
                `${getAuthorInitials(comment.userId)}`
              }}</span>
            </v-avatar>
          </div>
          
          <div class="d-flex flex-column">
            <div class="d-flex align-center ga-3">
              <div class="font-weight-bold">
                {{ getAuthorFullName(comment.userId) }}
              </div>
              <div style="font-size: 12px; opacity: 0.8;">
                {{ formatLogTime(comment.createdAt) }}
              </div>
            </div>
            <div id="userRole" style="font-size: 15px;">
              {{ comment.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="d-flex justify-center align-center" style="height: 100px;">
      <p>No comments yet.</p>
    </div>
    
    <Mentionable
      :keys="['@']"
      :items="mentionItems"
      offset="6"
      insert-space
    >
      <v-textarea
        v-model="newComment.content"
        variant="outlined"
        density="compact"
        rounded="lg"
        placeholder="Add a comment. Use @Name to mention someone."
      ></v-textarea>

      <template #item="{ item }">
        <div class="mention-item">
          <span>{{  item.value }}</span>         
        </div>
      </template>

      <template #no-result>
        <div>
          No user found
        </div>
      </template>
    </Mentionable>

    <v-btn
      variant="flat"
      class="text-none"
      style="color: white; background-color: #80162B; border-radius: 10px; height: 2.8rem; width: 14%;"
      @click="addNewComment()"
    >
      Comment
    </v-btn>
  </div>
</template>

<style scoped>
.modal-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 1.4rem;
}

.avatar-outline {
  outline: 1px solid rgb(211, 205, 205);
  outline-offset: 2px;
  border-radius: 50%;
}

.mention-item {
  cursor: pointer;
  font-weight: 500;
  padding: 1rem 2rem;
  border-radius: 6px;
  letter-spacing: 3%;
}

.mention-item:hover {
  background-color: #e0eff9bd;
}
</style>
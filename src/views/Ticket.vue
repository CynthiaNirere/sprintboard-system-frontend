<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import TicketServices from "../services/TicketServices.js";
import RefundServices from "../services/RefundServices.js";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const router = useRouter();
const tickets = ref([]);
const refunds = ref([]);
const tab = ref("upcoming");
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getTickets();
  await getRefunds();
});

async function getTickets() {
  await TicketServices.getTicketsForUser(user.value.id)
    .then((response) => {
      tickets.value = response.data;
    })
    .catch((error) => {
      console.log("ERROR:", error.response?.status, error.response?.data);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading tickets";
    });
}

async function getRefunds() {
  await RefundServices.getRefundsForUser(user.value.id)
    .then((response) => {
      refunds.value = response.data;
    })
    .catch((error) => {
      console.log("REFUND ERROR:", error.response?.status, error.response?.data);
    });
}

function getEventDateTime(event) {
  if (!event || !event.date || !event.startTime) return new Date(0);
  if (event.date === '0000-00-00' || event.date.startsWith('0000')) return new Date(0);
  const parsed = new Date(event.date);
  if (isNaN(parsed.getTime())) return new Date(0);
  const datePart = parsed.toISOString().split("T")[0];
  return new Date(`${datePart} ${event.startTime}`);
}

function getTicketForRefund(refund) {
  return tickets.value.find(t => t.payment?.id === refund.payment?.id) || null;
}

const refundedPaymentIds = computed(() =>
  refunds.value.map((r) => r.payment?.id)
);

const upcomingTickets = computed(() =>
  tickets.value.filter((t) =>
    t.event &&
    getEventDateTime(t.event) >= new Date() &&
    !refundedPaymentIds.value.includes(t.payment?.id)
  )
);

const pastTickets = computed(() =>
  tickets.value.filter((t) =>
    t.event &&
    getEventDateTime(t.event) < new Date() &&
    !refundedPaymentIds.value.includes(t.payment?.id)
  )
);

function goToRefund(ticket) {
  router.push({ name: "requestRefund", params: { paymentId: ticket.payment.id } });
}

async function downloadTicket(ticket) {
  try {
    const qrDataUrl = await QRCode.toDataURL(ticket.QRCode || `ticket-${ticket.id}`);
    const doc = new jsPDF({ unit: "pt", format: [400, 550] });

    doc.setFontSize(20);
    doc.text("Planetarium", 40, 50);

    doc.setFontSize(16);
    doc.text(ticket.event?.show?.title || "Unknown Show", 40, 90);

    doc.setFontSize(12);
    const eventDateTime = getEventDateTime(ticket.event);
    const dateText = eventDateTime.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.text(`${dateText} - ${ticket.event?.startTime || ""}`, 40, 115);
    doc.text(`Seat: ${ticket.seat?.rowNumber || ""}${ticket.seat?.seatNumber || ""}`, 40, 135);

    doc.addImage(qrDataUrl, "PNG", 100, 170, 200, 200);

    doc.setFontSize(10);
    doc.text(`Ticket ID: ${ticket.id}`, 40, 400);

    const filename = (ticket.event?.show?.title || "ticket").replace(/\s+/g, "_");
    doc.save(`${filename}_ticket_${ticket.id}.pdf`);
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Error generating ticket PDF";
  }
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-2">
        <v-col>
          <v-btn variant="text" @click="router.push({ name: 'shows' })" class="mr-2">
            Shows
          </v-btn>
          <v-btn variant="text" @click="router.push({ name: 'events' })">
            Events
          </v-btn>
        </v-col>
      </v-row>

      <v-card-title class="pl-0 text-h4 font-weight-bold mb-4">
        My Tickets
      </v-card-title>

      <v-tabs v-model="tab" class="mb-4">
        <v-tab value="upcoming">Upcoming</v-tab>
        <v-tab value="past">Past</v-tab>
        <v-tab value="refund">Refunds</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Upcoming Tab -->
        <v-window-item value="upcoming">
          <v-card
            v-for="ticket in upcomingTickets"
            :key="ticket.id"
            class="my-5 elevation-2"
            variant="outlined"
            :title="ticket.event?.show?.title || 'Unknown Show'"
            :subtitle="ticket.event?.date ? getEventDateTime(ticket.event).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' - ' + (ticket.event?.startTime || '') : ''"
          >
            <div class="d-flex">
              <v-card-text class="pt-0">
                Seat: {{ ticket.seat?.rowNumber }}{{ ticket.seat?.seatNumber }}
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="outlined" class="mr-2" @click="downloadTicket(ticket)">
                  Download
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="error"
                  @click="goToRefund(ticket)"
                  :disabled="refundedPaymentIds.includes(ticket.payment?.id)"
                >
                  Request Refund
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>

          <v-card v-if="!upcomingTickets || upcomingTickets.length === 0" class="my-5 elevation-2" variant="outlined">
            <v-card-text>
              No upcoming tickets.
              <v-btn variant="text" color="primary" @click="router.push({ name: 'shows' })" class="ml-2">
                Browse Shows
              </v-btn>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Past Tab -->
        <v-window-item value="past">
          <v-card
            v-for="ticket in pastTickets"
            :key="ticket.id"
            class="my-5 elevation-2"
            variant="outlined"
            :title="ticket.event?.show?.title || 'Unknown Show'"
            :subtitle="ticket.event?.date ? getEventDateTime(ticket.event).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''"
          >
            <div class="d-flex">
              <v-card-text class="pt-0">
                Seat: {{ ticket.seat?.rowNumber }}{{ ticket.seat?.seatNumber }}
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="outlined" class="mr-2" @click="downloadTicket(ticket)">
                  Download
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="error"
                  @click="goToRefund(ticket)"
                  :disabled="refundedPaymentIds.includes(ticket.payment?.id)"
                >
                  Request Refund
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>

          <v-card v-if="!pastTickets || pastTickets.length === 0" class="my-5 elevation-2" variant="outlined">
            <v-card-text>No past tickets.</v-card-text>
          </v-card>
        </v-window-item>

        <!-- Refunds Tab -->
        <v-window-item value="refund">
          <v-card
            v-for="refund in refunds"
            :key="refund.id"
            class="my-5 elevation-2"
            variant="outlined"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold">
                    {{ getTicketForRefund(refund)?.event?.show?.title || 'Unknown Show' }}
                  </div>
                  <div class="text-grey">
                    {{ getTicketForRefund(refund)?.event?.date && getTicketForRefund(refund)?.event?.date !== '0000-00-00'
                      ? new Date(getTicketForRefund(refund).event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Date TBD' }}
                    - {{ getTicketForRefund(refund)?.event?.startTime || '' }}
                  </div>
                  <div class="text-grey">
                    Seat: {{ getTicketForRefund(refund)?.seat?.rowNumber }}{{ getTicketForRefund(refund)?.seat?.seatNumber }}
                  </div>
                  <div class="text-grey text-caption mt-1">
                    Requested: {{ new Date(refund.requestDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                  </div>
                </div>
                <v-chip
                  :color="refund.refundStatus === 'Pending' ? 'orange' : refund.refundStatus === 'Approved' ? 'green' : 'error'"
                  size="small"
                >
                  {{ refund.refundStatus }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <v-card v-if="!refunds || refunds.length === 0" class="my-5 elevation-2" variant="outlined">
            <v-card-text>No refund requests.</v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
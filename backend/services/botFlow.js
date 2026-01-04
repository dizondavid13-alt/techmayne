const supabase = require('../config/supabase');
const { matchFAQ } = require('./faqMatcher');

// Bot conversation states
const STATES = {
  WELCOME: 'welcome',
  MAIN_MENU: 'main_menu',
  CHECK_AVAILABILITY: 'check_availability',
  COLLECT_EVENT_TYPE: 'collect_event_type',
  COLLECT_OTHER_EVENT_TYPE: 'collect_other_event_type',
  COLLECT_DATE: 'collect_date',
  COLLECT_LOCATION: 'collect_location',
  COLLECT_COVERAGE: 'collect_coverage',
  VIEW_PACKAGES: 'view_packages',
  FAQ_QUESTION: 'faq_question',
  COLLECT_NAME: 'collect_name',
  COLLECT_EMAIL: 'collect_email',
  COLLECT_PHONE: 'collect_phone',
  COMPLETION: 'completion'
};

class BotFlow {
  constructor(clientId, conversationId) {
    this.clientId = clientId;
    this.conversationId = conversationId;
  }

  // Helper method to check if contact info already collected
  hasContactInfo(collectedData) {
    return collectedData && collectedData.name && collectedData.email;
  }

  // Helper method to get display name for event type
  getEventDisplayName(eventKey) {
    const serviceLabels = {
      'wedding': 'wedding',
      'engagement': 'engagement session',
      'elopement': 'elopement',
      'portrait': 'portrait session',
      'corporate': 'corporate event',
      'family': 'family session',
      'maternity': 'maternity session',
      'other': 'event'
    };
    return serviceLabels[eventKey.toLowerCase()] || eventKey;
  }

  // Helper method to generate event type buttons based on client's services
  getEventTypeButtons(servicesOffered) {
    // Default to all services if not specified
    const services = servicesOffered || ['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other'];

    // Map service keys to display text
    const serviceLabels = {
      'wedding': 'Wedding',
      'engagement': 'Engagement',
      'elopement': 'Elopement',
      'portrait': 'Portrait Session',
      'corporate': 'Corporate Event',
      'family': 'Family Session',
      'maternity': 'Maternity',
      'other': 'Other Event'
    };

    // Generate buttons for each service the client offers
    return services.map(service => ({
      text: serviceLabels[service] || service,
      action: service
    }));
  }

  async getResponse(userMessage, currentState, collectedData = {}) {
    // Get client details for personalization
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', this.clientId)
      .single();

    let response = {};

    // Universal handler: "I'm all set!" should ALWAYS trigger closure, regardless of state
    if (userMessage === 'complete') {
      const visitorName = collectedData.name ? ` ${collectedData.name}` : '';
      const hasContact = this.hasContactInfo(collectedData);

      // Different closing messages based on whether we have their contact info
      if (hasContact) {
        response = {
          message: `Thanks so much for reaching out,${visitorName}! ${client.business_name} is excited to potentially work with you. Keep an eye on your inbox - you'll hear back soon!\n\nHave a wonderful day! 📸✨`,
          nextState: 'closed'
        };
      } else {
        response = {
          message: `Glad I could help! If you'd like to check availability or get in touch with ${client.business_name}, feel free to come back anytime.\n\nHave a wonderful day! 📸✨`,
          nextState: 'closed'
        };
      }

      // Update conversation state and return early
      await supabase
        .from('conversations')
        .update({
          current_state: response.nextState,
          collected_data: collectedData,
          last_message_at: new Date().toISOString()
        })
        .eq('id', this.conversationId);

      return response;
    }

    switch (currentState) {
      case STATES.WELCOME:
        response = {
          message: `Hi! I'm here to help you learn more about ${client.business_name}. What would you like to know?`,
          buttons: [
            { text: 'Check Availability', action: 'check_availability' },
            { text: 'View Packages & Pricing', action: 'view_packages' },
            { text: 'Ask a Question', action: 'ask_question' }
          ],
          nextState: STATES.MAIN_MENU
        };
        break;

      case STATES.MAIN_MENU:
        if (userMessage === 'check_availability') {
          response = {
            message: "Great! Let me gather some details to check availability. What type of event are you planning?",
            buttons: this.getEventTypeButtons(client.services_offered),
            nextState: STATES.COLLECT_EVENT_TYPE
          };
        } else if (userMessage === 'view_packages') {
          response = await this.handlePackagesView(client);
        } else if (userMessage === 'ask_question') {
          response = {
            message: "I'd be happy to answer your question! What would you like to know?",
            nextState: STATES.FAQ_QUESTION,
            inputType: 'text'
          };
        } else {
          // User typed instead of clicking
          response = {
            message: "Please choose one of the options below by clicking a button. How can I help you today?",
            buttons: [
              { text: 'Check Availability', action: 'check_availability' },
              { text: 'View Packages & Pricing', action: 'view_packages' },
              { text: 'Ask a Question', action: 'ask_question' }
            ],
            nextState: STATES.MAIN_MENU
          };
        }
        break;

      case STATES.COLLECT_EVENT_TYPE:
        // Check if it's a valid event type selection based on client's services
        const validEventTypes = client.services_offered || ['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other'];
        if (validEventTypes.includes(userMessage.toLowerCase())) {
          // Special handling for "other" - ask what type of event it is
          if (userMessage.toLowerCase() === 'other') {
            response = {
              message: "What type of event is this?",
              nextState: STATES.COLLECT_OTHER_EVENT_TYPE,
              inputType: 'text',
              placeholder: 'e.g., Corporate headshots, Birthday party'
            };
          } else {
            collectedData.event_type = userMessage;
            const eventDisplayName = this.getEventDisplayName(userMessage);
            response = {
              message: `Perfect! When is your ${eventDisplayName}?`,
              nextState: STATES.COLLECT_DATE,
              inputType: 'text',
              placeholder: 'e.g., June 15, 2026'
            };
          }
        } else {
          // User typed instead of clicking
          response = {
            message: "Please select your event type by clicking one of the buttons below.",
            buttons: this.getEventTypeButtons(client.services_offered),
            nextState: STATES.COLLECT_EVENT_TYPE
          };
        }
        break;

      case STATES.COLLECT_OTHER_EVENT_TYPE:
        // Store the custom event type and proceed to date collection
        collectedData.event_type = userMessage;
        // For custom events, use exactly what the user typed
        response = {
          message: `Perfect! When is your ${userMessage.toLowerCase()}?`,
          nextState: STATES.COLLECT_DATE,
          inputType: 'text',
          placeholder: 'e.g., June 15, 2026'
        };
        break;

      case STATES.COLLECT_DATE:
        collectedData.event_date = userMessage;
        response = {
          message: "Where will your event take place?",
          nextState: STATES.COLLECT_LOCATION,
          inputType: 'text',
          placeholder: 'e.g., San Francisco, CA'
        };
        break;

      case STATES.COLLECT_LOCATION:
        collectedData.location = userMessage;
        response = {
          message: "How many hours of coverage are you looking for?",
          buttons: [
            { text: '4-6 hours', action: '4-6 hours' },
            { text: '6-8 hours', action: '6-8 hours' },
            { text: '8-10 hours', action: '8-10 hours' },
            { text: 'Full day (10+ hours)', action: 'full day' },
            { text: 'Not sure yet', action: 'not sure' }
          ],
          nextState: STATES.COLLECT_COVERAGE
        };
        break;

      case STATES.COLLECT_COVERAGE:
        // Check if it's a valid coverage option or typed text
        const validCoverages = ['4-6 hours', '6-8 hours', '8-10 hours', 'full day', 'not sure'];
        if (validCoverages.includes(userMessage.toLowerCase())) {
          collectedData.coverage_range = userMessage;

          // Check if we already have contact info
          if (this.hasContactInfo(collectedData)) {
            // Ask if they want to reuse previous contact info or enter new
            response = {
              message: `I can use your previous contact info (${collectedData.name}, ${collectedData.email}) or you can provide different details. Would you like to use the same contact information?`,
              buttons: [
                { text: 'Use Previous Info', action: 'use_previous_contact' },
                { text: 'Enter New Info', action: 'enter_new_contact' }
              ],
              nextState: 'confirm_contact_reuse'
            };
          } else {
            // First time - just ask for contact info
            response = {
              message: "Excellent! Let me get your contact info so the photographer can reach out with availability and pricing details.\n\nWhat's your name?",
              nextState: STATES.COLLECT_NAME,
              inputType: 'text'
            };
          }
        } else {
          // User typed instead of clicking
          response = {
            message: "Please select a coverage option by clicking one of the buttons below.",
            buttons: [
              { text: '4-6 hours', action: '4-6 hours' },
              { text: '6-8 hours', action: '6-8 hours' },
              { text: '8-10 hours', action: '8-10 hours' },
              { text: 'Full day (10+ hours)', action: 'full day' },
              { text: 'Not sure yet', action: 'not sure' }
            ],
            nextState: STATES.COLLECT_COVERAGE
          };
        }
        break;

      case STATES.COLLECT_NAME:
        collectedData.name = userMessage;
        response = {
          message: `Thanks, ${userMessage}! What's the best email to reach you?`,
          nextState: STATES.COLLECT_EMAIL,
          inputType: 'email'
        };
        break;

      case STATES.COLLECT_EMAIL:
        collectedData.email = userMessage;
        response = {
          message: "And your phone number? (You can skip this if you prefer)",
          buttons: [
            { text: 'Skip', action: 'skip_phone' }
          ],
          nextState: STATES.COLLECT_PHONE,
          inputType: 'tel',
          placeholder: '(555) 123-4567'
        };
        break;

      case STATES.COLLECT_PHONE:
        if (userMessage !== 'skip_phone') {
          collectedData.phone = userMessage;
        }

        // Create the lead
        await this.createLead(collectedData);

        const bookingLinkText = client.booking_link
          ? `\n\nYou can also schedule a call directly here: ${client.booking_link}`
          : '';

        response = {
          message: `Perfect! I've sent your information to ${client.business_name}. They'll reach out within 24 hours to discuss availability and next steps.${bookingLinkText}\n\nIs there anything else I can help with?`,
          buttons: [
            { text: 'Ask Another Question', action: 'ask_question' },
            { text: "I'm all set!", action: 'complete' }
          ],
          nextState: STATES.COMPLETION
        };
        break;

      case STATES.FAQ_QUESTION:
        console.log('===== FAQ QUESTION STATE =====');
        console.log('Client ID:', this.clientId);
        console.log('User Message:', userMessage);
        const faqResponse = await matchFAQ(this.clientId, userMessage);
        console.log('FAQ Response:', faqResponse);

        if (faqResponse.found) {
          let faqAnswer = faqResponse.answer;

          // Special handling for services FAQ - make it dynamic based on client's actual services
          if (faqResponse.question === 'What services do you offer?' && client.services_offered && client.services_offered.length > 0) {
            const serviceLabels = {
              'wedding': 'weddings',
              'engagement': 'engagement sessions',
              'elopement': 'elopements',
              'portrait': 'portrait sessions',
              'corporate': 'corporate events',
              'family': 'family sessions',
              'maternity': 'maternity photography',
              'other': 'other events'
            };

            const offeredServices = client.services_offered
              .map(s => serviceLabels[s] || s)
              .filter(s => s); // Remove any undefined values

            if (offeredServices.length > 0) {
              const serviceList = offeredServices.length === 1
                ? offeredServices[0]
                : offeredServices.slice(0, -1).join(', ') + ', and ' + offeredServices[offeredServices.length - 1];

              faqAnswer = `I offer ${serviceList}. Each service can be customized to fit your specific needs and vision!`;
            }
          }

          response = {
            message: faqAnswer + "\n\nDid that answer your question?",
            buttons: [
              { text: 'Yes, thanks!', action: 'faq_answered' },
              { text: 'Check Availability', action: 'check_availability' },
              { text: 'Ask Another Question', action: 'ask_question' }
            ],
            nextState: STATES.COMPLETION
          };
        } else {
          // Question not found in FAQ
          collectedData.additional_notes = `Question: ${userMessage}`;

          // Check if we already have contact info
          if (this.hasContactInfo(collectedData)) {
            // Create lead with the question as additional notes
            await this.createLead(collectedData);

            response = {
              message: `That's a great question! I've forwarded it to ${client.business_name} and they'll get back to you with a detailed answer.\n\nAnything else I can help with?`,
              buttons: [
                { text: 'Ask Another Question', action: 'ask_question' },
                { text: "I'm all set!", action: 'complete' }
              ],
              nextState: STATES.COMPLETION
            };
          } else {
            response = {
              message: "That's a great question! I want to make sure you get the most accurate answer. Let me collect your info so the photographer can respond directly.\n\nWhat's your name?",
              nextState: STATES.COLLECT_NAME,
              inputType: 'text'
            };
          }
        }
        break;

      case STATES.COMPLETION:
        if (userMessage === 'ask_question') {
          response = {
            message: "Sure! What would you like to know?",
            nextState: STATES.FAQ_QUESTION,
            inputType: 'text'
          };
        } else if (userMessage === 'faq_answered') {
          // After FAQ is answered, ask if they need anything else
          response = {
            message: "Great! Is there anything else I can help you with?",
            buttons: [
              { text: 'Check Availability', action: 'check_availability' },
              { text: 'Ask Another Question', action: 'ask_question' },
              { text: "I'm all set!", action: 'complete' }
            ],
            nextState: STATES.COMPLETION
          };
        } else if (userMessage === 'complete') {
          const visitorName = collectedData.name ? ` ${collectedData.name}` : '';
          const hasContact = this.hasContactInfo(collectedData);

          // Different closing messages based on whether we have their contact info
          if (hasContact) {
            response = {
              message: `Thanks so much for reaching out,${visitorName}! ${client.business_name} is excited to potentially work with you. Keep an eye on your inbox - you'll hear back soon!\n\nHave a wonderful day! 📸✨`,
              nextState: 'closed'
            };
          } else {
            response = {
              message: `Glad I could help! If you'd like to check availability or get in touch with ${client.business_name}, feel free to come back anytime.\n\nHave a wonderful day! 📸✨`,
              nextState: 'closed'
            };
          }
        } else if (userMessage === 'check_availability') {
          // Allow checking availability again without re-asking for contact info
          response = {
            message: "I can help you check another date! What type of event are you interested in?",
            buttons: this.getEventTypeButtons(client.services_offered),
            nextState: STATES.COLLECT_EVENT_TYPE
          };
        } else if (userMessage === 'view_packages') {
          response = await this.handlePackagesView(client);
        } else {
          // User typed something - remind them to click buttons
          response = {
            message: "Please choose one of the options below. Is there anything else I can help with?",
            buttons: [
              { text: 'Check Availability', action: 'check_availability' },
              { text: 'Ask Another Question', action: 'ask_question' },
              { text: "I'm all set!", action: 'complete' }
            ],
            nextState: STATES.COMPLETION
          };
        }
        break;

      case 'confirm_contact_reuse':
        if (userMessage === 'use_previous_contact') {
          // Reuse existing contact info and create lead
          await this.createLead(collectedData);

          const bookingLinkText = client.booking_link
            ? `\n\nYou can also schedule a call directly here: ${client.booking_link}`
            : '';

          response = {
            message: `Perfect! I've sent your inquiry to ${client.business_name}. They'll reach out within 24 hours with availability and pricing.${bookingLinkText}\n\nIs there anything else I can help with?`,
            buttons: [
              { text: 'Ask Another Question', action: 'ask_question' },
              { text: "I'm all set!", action: 'complete' }
            ],
            nextState: STATES.COMPLETION
          };
        } else if (userMessage === 'enter_new_contact') {
          // Clear previous contact info and ask for new
          delete collectedData.name;
          delete collectedData.email;
          delete collectedData.phone;

          response = {
            message: "No problem! What's the name for this inquiry?",
            nextState: STATES.COLLECT_NAME,
            inputType: 'text'
          };
        } else {
          // User typed instead of clicking
          response = {
            message: "Please choose one of the options below.",
            buttons: [
              { text: 'Use Previous Info', action: 'use_previous_contact' },
              { text: 'Enter New Info', action: 'enter_new_contact' }
            ],
            nextState: 'confirm_contact_reuse'
          };
        }
        break;

      case 'closed':
        // Conversation was closed, but user typed again - restart
        response = {
          message: `Welcome back! How can I help you today?`,
          buttons: [
            { text: 'Check Availability', action: 'check_availability' },
            { text: 'View Packages & Pricing', action: 'view_packages' },
            { text: 'Ask a Question', action: 'ask_question' }
          ],
          nextState: STATES.MAIN_MENU
        };
        break;

      default:
        // Fallback
        response = {
          message: "I'm not sure how to help with that. Let me start over.",
          buttons: [
            { text: 'Check Availability', action: 'check_availability' },
            { text: 'View Packages', action: 'view_packages' },
            { text: 'Ask a Question', action: 'ask_question' }
          ],
          nextState: STATES.MAIN_MENU
        };
    }

    // Update conversation state and data
    await supabase
      .from('conversations')
      .update({
        current_state: response.nextState,
        collected_data: collectedData,
        last_message_at: new Date().toISOString()
      })
      .eq('id', this.conversationId);

    return response;
  }

  async handlePackagesView(client) {
    let message = "Here's an overview of what's offered:\n\n";

    if (client.starting_price) {
      message += `Packages starting at ${client.starting_price}\n`;
    }

    message += `Gallery delivery: ${client.gallery_timeline}\n`;
    message += `Service area: ${client.service_area || 'Available on request'}\n\n`;
    message += "For detailed pricing and package information, I'd recommend connecting directly with the photographer.";

    return {
      message,
      buttons: [
        { text: 'Check My Date', action: 'check_availability' },
        { text: 'Ask a Question', action: 'ask_question' }
      ],
      nextState: STATES.MAIN_MENU
    };
  }

  async createLead(data) {
    try {
      // Insert lead
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          client_id: this.clientId,
          conversation_id: this.conversationId,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          event_type: data.event_type || null,
          event_date: data.event_date || null,
          location: data.location || null,
          coverage_range: data.coverage_range || null,
          additional_notes: data.additional_notes || null
        })
        .select()
        .single();

      if (error) throw error;

      // Try to send email notification (optional - won't fail if email not configured)
      try {
        const resendService = require('./resendService');
        await resendService.sendLeadNotification(this.clientId, lead);
        console.log('Email notification sent for lead:', lead.id);
      } catch (emailError) {
        console.warn('Email notification failed (this is OK if email not configured):', emailError.message);
      }

      // Mark conversation as completed
      await supabase
        .from('conversations')
        .update({ completed: true })
        .eq('id', this.conversationId);

      console.log('Lead created:', lead.id);
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }
}

module.exports = { BotFlow, STATES };

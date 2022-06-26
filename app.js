const { App, LogLevel } = require('@slack/bolt');
require('dotenv').config();

// const receiver = new ExpressReceiver({
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });

// const app = new App({
//   // signingSecret: process.env.SLACK_SIGNING_SECRET,
//   token: process.env.TOKEN,
//   receiver,
// });

const databaseData = {};
const database = {
  set: async (key, data) => {
    databaseData[key] = data;
  },
  get: async (key) => {
    return databaseData[key];
  },
};

const app = new App({
  logLevel: LogLevel.DEBUG,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: [
    'channels:read',
    'chat:write',
    'app_mentions:read',
    'commands',
    'channels:history',
    'groups:history',
    'im:history',
    'mpim:history',
  ],
  installationStore: {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      if (
        installation.isEnterpriseInstall &&
        installation.enterprise !== undefined
      ) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // change the line below so it deletes from your database
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        // org wide app installation deletion
        return await database.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await database.delete(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  },
  installerOptions: {
    // If this is true, /slack/install redirects installers to the Slack authorize URL
    // without rendering the web page with "Add to Slack" button.
    // This flag is available in @slack/bolt v3.7 or higher
    // directInstall: true,
  },
});

// receiver.router.post('/secret-page', (req, res) => {
//   console.log(
//     req,
//     '🚀 ~ file: app.js ~ line 15 ~ receiver.router.post ~ res',
//     res
//   );
//   // You're working with an express req and res now.
//   res.send('yay!');
// });

app.command('/test', async ({ command, ack, say }) => {
  try {
    await ack();
    say('Yaaay! that command works!');
  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

app.event('app_home_opened', async ({ event, client, context }) => {
  console.log('app opened event');

  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,
      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':bulb: *Support Room* is a set of tools created by therapists to help you have a happier work life. Support Room lets you `talk to a therapist` — or `Ask a Therapist` anything about your own mental health or about supporting others. It also lets you have better work conversations, set better boundaries, and celebrate the people you work with.',
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Start your journey',
                emoji: true,
              },
              value: 'start_journey',
              action_id: 'button-start-journey',
              url: 'https://new.supportroom.com/',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Support Room Therapy',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':mailbox_with_mail: *Speak to your Therapist* \nSpeak about anything that’s playing on your mind — relationships, wellbeing, the meaning of life. You’ll receive a thoughtful reply within two UK working days, written by a therapist from scratch.',
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Speak to your Therapist',
                emoji: true,
              },
              value: 'speak_to_therapist',
              action_id: 'button-speak-to-therapist',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':ear: *Book a video session* \n Talk to a therapist about your feelings, your relationships, your career — whatever’s on your mind. You don’t need a reason to book: it’s therapy without the commitment.',
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Book one-off session',
                emoji: true,
              },
              style: 'primary',
              value: 'book_one_off_session',
              action_id: 'button-book-one-off-session',
            },
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Resources',
              emoji: true,
            },
          },
          {
            type: 'actions',
            block_id: 'actions-resources',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: ':books: Books & :movie_camera: Videos',
                },
                value: 'booksAndVideos',
                action_id: 'resources-books-and-videos',
                url: 'https://new.supportroom.com/well-being',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: ':phone: Crisis lines',
                },
                value: 'crisisLines',
                action_id: 'resources-crisis-lines',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: ':love_letter: Plus one',
                },
                value: 'plusOne',
                action_id: 'resources-plus-one',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

app.action('button-start-journey', async ({ ack, body, context, say }) => {
  // Acknowledge the button request
  ack();

  try {
  } catch (error) {
    console.error(error);
  }
});

app.action('therapist-submit', async ({ action, ack, say }) => {
  // acknowledge the request right away
  await ack();
  await say('Thanks for clicking the fancy button');
});

app.action('button-speak-to-therapist', async ({ ack, body, context, say }) => {
  // Acknowledge the button request
  ack();

  try {
    const result = await app.client.views.open({
      trigger_id: body.trigger_id,
      // View payload with updated blocks
      view: {
        title: {
          type: 'plain_text',
          text: 'Ask a Therapist',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: 'Ask',
          emoji: true,
        },
        type: 'modal',
        callback_id: 'askATherapist',
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true,
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Ask about depression, anxiety, burnout, stress, a tricky relationship, supporting others — or anything else that keeps you up at night.',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':alarm_clock: _A therapist will get back to you within two UK working days._',
            },
          },
          {
            type: 'input',
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'your-question-to-therapist-action',
            },
            label: {
              type: 'plain_text',
              text: 'Your Question',
              emoji: true,
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

app.action(
  'button-book-one-off-session',
  async ({ ack, body, context, say }) => {
    ack();
    try {
      const result = await app.client.views.open({
        trigger_id: body.trigger_id,
        // View payload with updated blocks
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Book video session',
          },
          submit: {
            type: 'plain_text',
            text: 'Submit',
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: 'Work is in progress.',
                emoji: true,
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
);

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();

import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import {
  CfnApp,
  CfnCampaign,
  CfnSegment,
} from "aws-cdk-lib/aws-pinpoint";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib/core";
import { configureAutoTrack } from 'aws-amplify/analytics';



const backend = defineBackend({
  auth, 
  data,
  // additional resources 
});

configureAutoTrack({
  enable: true,
  type: 'session',
})

const analyticsStack = backend.createStack("analytics-stack"); // create analyticsStack


const inAppMessagingStack = backend.createStack("inAppMessaging-stack");

backend.addOutput({
  storage: {
    aws_region: "us-east-1",
    bucket_name: "amplify-outputs",
  },
});

// create a Pinpoint app
const pinpoint = new CfnApp(inAppMessagingStack, "Pinpoint", {
  name: "myPinpointApp",
});

// create a segment 
const mySegment = new CfnSegment(inAppMessagingStack, "Segment", {
  applicationId: pinpoint.ref,
  name: "mySegment",
});

// create a campaign with event and in-app message template
new CfnCampaign(inAppMessagingStack, "Campaign", {
  applicationId: pinpoint.ref,
  name: "MyCampaign",
  segmentId: mySegment.attrSegmentId,
  schedule: {
    // ensure the start and end time are in the future
    startTime: "2024-07-03T20:10:34Z", 
    endTime: "2024-07-20T13:22:40Z",
    frequency: "IN_APP_EVENT",
    eventFilter: {
      dimensions: {
        eventType: {
          dimensionType: "INCLUSIVE",
          values: ["my_first_event"],
        },
      },
      filterType: "ENDPOINT",
    },
  },

  messageConfiguration: {
    inAppMessage: {
      layout: "TOP_BANNER",
      content: [
        {
          // define the content of the in-app message
          bodyConfig: {
            alignment: "CENTER",
            body: "(광고) To-Do premium을 구매하여 광고를 제거하고 task를 빠르게 처리하세요.",
            textColor: "#000000",
          },
          backgroundColor: "#B0FA63",
          headerConfig: {
            alignment: "CENTER",
            header: "🎉첫 번째 task를 생성했습니다!",
            textColor: "#000000",
          },
          // optionally, define buttons, images, etc.
        },
      ],
    },
  },
});

//create an IAM policy to allow interacting with Pinpoint in-app messaging
const pinpointPolicy = new Policy(inAppMessagingStack, "PinpointPolicy", {
  policyName: "PinpointPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "mobiletargeting:GetInAppMessages",
        "mobiletargeting:UpdateEndpoint",
        "mobiletargeting:PutEvents",
      ],
      resources: [pinpoint.attrArn + "/*", pinpoint.attrArn],
    }),
  ],
});

// apply the policy to the authenticated and unauthenticated roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(pinpointPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(pinpointPolicy);

// patch the custom Pinpoint resource to the expected output configuration
backend.addOutput({
  // auth: {
    // aws_region: "us-east-1",
    // user_pool_id: "us-east-1_ohK3ONhIR"
  // },
  notifications: {
    amazon_pinpoint_app_id: pinpoint.ref,
    aws_region: Stack.of(pinpoint).region,
    channels: ["IN_APP_MESSAGING"],
  },
});
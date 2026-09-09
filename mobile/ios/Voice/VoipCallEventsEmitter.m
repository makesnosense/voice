#import <React/RCTEventEmitter.h>
#import "Voice-Swift.h"

// translates apple's in-process VoipCallAccepted / VoipCallEnded notifications into RN events.

@interface VoipCallEventsEmitter : RCTEventEmitter
@end

@implementation VoipCallEventsEmitter

RCT_EXPORT_MODULE();

// We put all readers/writers on one queue (main, because CallKit already chose it) so they never
// overlap.

// Init this object (VoipCallEventsEmitter — the ObjC module RN constructs) on the main thread
+ (BOOL)requiresMainQueueSetup {
  return YES;
}

// this getter RN already calls to get queue for all RCT_EXPORT_METHODs on this module
// (and startObserving / stopObserving). default is a private background serial queue.
- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (NSArray<NSString*>*)supportedEvents {
  return @[ @"callAccepted", @"callEnded" ];
}

- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleCallAccepted:)
                                               name:@"VoipCallAccepted"
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleCallEnded:)
                                               name:@"VoipCallEnded"
                                             object:nil];
}

- (void)stopObserving {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

// two hops
// Swift posts VoipCallAccepted          ← Apple NotificationCenter
//         ↓
// handleCallAccepted:                  ← our code *received* the Apple notification
//         ↓
// sendEventWithName:@"callAccepted"    ← we *send* to JS (RN)

- (void)handleCallAccepted:(NSNotification*)notification {
  [self sendEventWithName:@"callAccepted" body:notification.userInfo];
}

- (void)handleCallEnded:(__unused NSNotification*)notification {
  [self sendEventWithName:@"callEnded" body:nil];
}

// lets js drain storedAcceptedCallInfo if the notification fired when RN was down
RCT_EXPORT_METHOD(takeStoredAcceptedCallInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([[VoipPushManager shared] takeStoredAcceptedCallInfo]);
}

RCT_EXPORT_METHOD(fulfillPendingAnswerAction) {
  [[VoipPushManager shared] fulfillPendingAnswerAction];
}

@end

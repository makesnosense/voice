#import <React/RCTEventEmitter.h>

// translates apple's in-process VoipCallAccepted notification into an RN event.
// does not talk to CallKit or VoipPushManager — js still cannot hear NotificationCenter directly.

@interface VoipCallAcceptedEvent : RCTEventEmitter
@end

@implementation VoipCallAcceptedEvent

RCT_EXPORT_MODULE();

// We put all readers/writers on one queue (main, because CallKit already chose it) so they never
// overlap.

// Init this object (VoipCallAcceptedEvent — the ObjC module RN constructs) on the main thread
+ (BOOL)requiresMainQueueSetup {
  return YES;
}

// this getter RN already calls to get queue for all RCT_EXPORT_METHODs on this module
// (and startObserving / stopObserving). default is a private background serial queue.
- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (NSArray<NSString*>*)supportedEvents {
  return @[ @"callAccepted" ];
}

- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleCallAccepted:)
                                               name:@"VoipCallAccepted"
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

@end

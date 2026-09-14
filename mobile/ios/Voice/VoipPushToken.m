#import <React/RCTEventEmitter.h>
#import "Voice-Swift.h"

@interface VoipPushToken : RCTEventEmitter
@end

@implementation VoipPushToken

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (NSArray<NSString*>*)supportedEvents {
  return @[ @"voipTokenUpdated" ];
}

- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleVoipTokenUpdated:)
                                               name:@"VoipTokenUpdated"
                                             object:nil];
}

- (void)stopObserving {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleVoipTokenUpdated:(NSNotification*)notification {
  [self sendEventWithName:@"voipTokenUpdated" body:notification.userInfo];
}

RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([VoipCallManager shared].currentToken);
}

@end

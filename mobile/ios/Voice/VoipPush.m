#import <React/RCTBridgeModule.h>
// generated Swift→ObjC header. this is how VoipPushManager and currentToken exist in this .m file.
#import "Voice-Swift.h"

@interface VoipPush : NSObject <RCTBridgeModule>
@end

@implementation VoipPush

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([VoipPushManager shared].currentToken);
}

@end

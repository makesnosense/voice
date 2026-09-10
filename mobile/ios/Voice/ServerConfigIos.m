#import <React/RCTBridgeModule.h>
#import "Voice-Swift.h"

@interface ServerConfigIosModule : NSObject <RCTBridgeModule>
@end

@implementation ServerConfigIosModule

RCT_EXPORT_MODULE(ServerConfigIos);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSDictionary*)constantsToExport {
  return @{
    @"devHost" : [ServerConfigIos devHost],
    @"prodHost" : [ServerConfigIos prodHost],
  };
}

@end

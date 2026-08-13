import { Router, type Response } from 'express';
import { requireAccessToken, requireRefreshToken } from '../middleware/auth';
import { registerDeviceSchema } from '../schemas/devices';
import {
  findDeviceByRefreshJti,
  createDevice,
  updateDevice,
  getUserDevices,
} from '../services/devices';
import type { Device } from '../../../shared/types/devices';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';

const router = Router();

router.post('/', requireRefreshToken, async (req, res: Response<Device | ApiErrorResponse>) => {
  if (!req.refreshPayload) {
    return res
      .status(401)
      .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
  }

  const result = registerDeviceSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errorMessage: 'invalid request',
      errorCode: ERROR_CODE.INVALID_REQUEST,
      details: result.error.issues,
    });
  }

  const { platform, deviceName, fcmToken, voipPushToken } = result.data;
  const { userId, jti } = req.refreshPayload;

  try {
    const existingDevice = await findDeviceByRefreshJti(jti);

    if (existingDevice) {
      const updated = await updateDevice(
        jti, // JTI is the key now
        userId,
        platform,
        deviceName,
        fcmToken,
        voipPushToken
      );
      if (!updated) {
        return res
          .status(404)
          .json({ errorMessage: 'device not found', errorCode: ERROR_CODE.DEVICE_NOT_FOUND });
      }
      return res.json(updated);
    }

    const device = await createDevice(
      jti, // JTI is the primary key
      userId,
      platform,
      deviceName,
      fcmToken,
      voipPushToken
    );

    res.status(201).json(device);
  } catch (error) {
    console.error('failed to register device:', error);
    res
      .status(500)
      .json({ errorMessage: 'failed to register device', errorCode: ERROR_CODE.INTERNAL_ERROR });
  }
});

router.get('/', requireAccessToken, async (req, res: Response<Device[] | ApiErrorResponse>) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
  }
  const { userId } = req.user;

  try {
    const userDevices = await getUserDevices(userId);
    res.json(userDevices);
  } catch (error) {
    console.error('failed to fetch devices:', error);
    res
      .status(500)
      .json({ errorMessage: 'failed to fetch devices', errorCode: ERROR_CODE.INTERNAL_ERROR });
  }
});

export default router;

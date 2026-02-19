import { Router } from 'express';
import { requireRefreshToken } from '../middleware/auth';
import { registerDeviceSchema } from '../schemas/devices';
import {
  findDeviceByRefreshJti,
  createDevice,
  updateDevice,
  getUserDevices,
} from '../services/devices';

const router = Router();

router.post('/', requireRefreshToken, async (req, res) => {
  const result = registerDeviceSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'invalid request', details: result.error.issues });
  }

  const { platform, deviceName, fcmToken, voipPushToken } = result.data;
  const { userId, jti } = req.refreshPayload!;

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
        return res.status(404).json({ error: 'device not found' });
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
    res.status(500).json({ error: 'failed to register device' });
  }
});

router.get('/', requireRefreshToken, async (req, res) => {
  const { userId } = req.refreshPayload!;

  try {
    const userDevices = await getUserDevices(userId);
    res.json(userDevices);
  } catch (error) {
    console.error('failed to fetch devices:', error);
    res.status(500).json({ error: 'failed to fetch devices' });
  }
});

export default router;

import { Router, type Response } from 'express';
import { requireAccessToken, requireRefreshToken } from '../middleware/auth';
import { findUserByEmail, deleteUser } from '../services/users';
import { byEmailSchema, updateNameSchema } from '../schemas/users';
import { updateUserName, exportUserData } from '../services/users';
import {
  dataExportLimiter,
  updateNameLimiter,
  userLookupByEmailLimiter,
  deleteAccountLimiter,
} from '../middleware/api-rate-limiters';
import { reissueAccessTokenWithUpdatedName } from '../utils/jwt';
import type { PublicUser } from '../../../shared/types/users';
import type { RenewAccessTokenResponse } from '../../../shared/types/auth';
import type { DataExport } from '../../../shared/types/core';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';

const router = Router();

router.get(
  '/',
  requireAccessToken,
  userLookupByEmailLimiter,
  async (req, res: Response<PublicUser | ApiErrorResponse>) => {
    const result = byEmailSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        errorMessage: 'Invalid request',
        errorCode: ERROR_CODE.INVALID_REQUEST,
        details: result.error.issues,
      });
    }

    try {
      const user = await findUserByEmail(result.data.email);
      if (!user) {
        return res
          .status(404)
          .json({ errorMessage: 'User not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
      }

      res.json(user);
    } catch (error) {
      console.error('failed to find user:', error);
      res
        .status(500)
        .json({ errorMessage: 'failed to find user', errorCode: ERROR_CODE.INTERNAL_ERROR });
    }
  }
);

router.patch(
  '/me',
  requireAccessToken,
  updateNameLimiter,
  async (req, res: Response<RenewAccessTokenResponse | ApiErrorResponse>) => {
    const result = updateNameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errorMessage: 'invalid request',
        errorCode: ERROR_CODE.INVALID_REQUEST,
        details: result.error.issues,
      });
    }

    const user = req.user;
    const authHeader = req.headers.authorization;
    if (!user || !authHeader) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }

    const rawToken = authHeader.substring(7);

    try {
      const updated = await updateUserName(user.userId, result.data.name);
      if (!updated) {
        return res
          .status(404)
          .json({ errorMessage: 'User not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
      }

      const accessToken = reissueAccessTokenWithUpdatedName(rawToken, updated.name);
      res.json({ accessToken });
    } catch (error) {
      console.error('Failed to update name:', error);
      res
        .status(500)
        .json({ errorMessage: 'Failed to update name', errorCode: ERROR_CODE.INTERNAL_ERROR });
    }
  }
);

router.delete(
  '/me',
  requireRefreshToken,
  deleteAccountLimiter,
  async (req, res: Response<ApiErrorResponse>) => {
    if (!req.refreshPayload) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }
    const { userId } = req.refreshPayload;

    try {
      const deleted = await deleteUser(userId);
      if (!deleted) {
        return res
          .status(404)
          .json({ errorMessage: 'User not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
      }

      console.log(`🗑️  deleted account: ${userId}`);
      res.status(204).end();
    } catch (error) {
      console.error('failed to delete account:', error);
      res.status(500).json({
        errorMessage: 'failed to delete account',
        errorCode: ERROR_CODE.INTERNAL_ERROR,
      });
    }
  }
);

router.get(
  '/me/export',
  requireAccessToken,
  dataExportLimiter,
  async (req, res: Response<DataExport | ApiErrorResponse>) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
    }
    const { userId } = req.user;

    try {
      const data = await exportUserData(userId);
      if (!data) {
        return res
          .status(404)
          .json({ errorMessage: 'User not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
      }

      res.json(data);
    } catch (error) {
      console.error('failed to export user data:', error);
      res.status(500).json({
        errorMessage: 'failed to export user data',
        errorCode: ERROR_CODE.INTERNAL_ERROR,
      });
    }
  }
);

export default router;

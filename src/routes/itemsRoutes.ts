import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { CustomRequest, Item } from "../libs/types.ts";
// import database
import { items } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from "../../src/middlewares/authenMiddleware.ts";

const router = Router();

// GET /api/vXXX/items/:userId 
router.get("/:userId", authenticateToken, (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const paramUserId = req.params.userId;

    const parseResult = zUserId.safeParse(paramUserId);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues[0]?.message,
      });
    }

    if (paramUserId !== user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }

    const filteredItems = items.filter((i: Item) => i.userId === user?.userId);

    // console.log("filteredItems: ", filteredItems);

    if (filteredItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: `items for user ID ${paramUserId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: filteredItems
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/:userId", authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const paramUserId = req.params.userId;

    const body = req.body as Item;

    // console.log(paramUserId);
    // console.log(body);

    const vldUserId = zUserId.safeParse(paramUserId);
    // const vldBody = zItemPostBody.safeParse(body);

    if (!vldUserId.success) {
      return res.status(400).json({
        message: "Validation UserId failed",
        errors: vldUserId.error.issues[0]?.message,
      });
    }

    // if (!vldBody.success) {
    //   return res.status(400).json({
    //     message: "Validation Body failed",
    //     errors: vldBody.error.issues[0]?.message,
    //   });
    // }

    if (paramUserId !== user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }

    // product_name, unit_price, quantity, category

    const newId = uuidv4();

    const payload = {
      userId: paramUserId,
      itemId: newId,
      product_name: body.product_name,
      unit_price: body.unit_price,
      quantity: body.quantity,
      category: body.category
    };

    items.push(payload);

    res.status(200).json({
      success: true,
      message: "New Item has been added successfully",
      data: payload
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// Delete /api/vXXX/items/:userId
router.delete("/:userId", authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    const paramUserId = req.params.userId;

    const body = req.body;

    // console.log(paramUserId);
    // console.log(body);


    const vldUserId = zUserId.safeParse(paramUserId);
    // const vldBody = zItemDeleteBody.safeParse({ ...body, paramUserId });

    if (!vldUserId.success) {
      return res.status(400).json({
        message: "Validation UserId failed",
        errors: vldUserId.error.issues[0]?.message,
      });
    }

    // if (!vldBody.success) {
    //   return res.status(400).json({
    //     message: "Validation Body failed",
    //     errors: vldBody.error.issues[0]?.message,
    //   });
    // }

    if (paramUserId !== user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }

    // product_name, unit_price, quantity, category

    const itemId = body.itemId as string;

    const foundIndex = items.findIndex((i: Item) => i.itemId === itemId && i.userId === paramUserId);

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `There are no items with item ID ${itemId} for user ID ${paramUserId}`
      });
    }

    const deletedItem = items[foundIndex];

    // console.log("deletedItem: ", deletedItem);

    items.splice(foundIndex, 1);

    res.status(200).json({
      success: true,
      message: `Item ID ${itemId} for user ID ${paramUserId} has been deleted successfully`,
      data: deletedItem
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
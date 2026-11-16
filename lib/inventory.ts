import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order, { IOrder } from '@/models/Order';
import Product from '@/models/Product';
import Party from '@/models/Party';

export interface FulfillOrderResult {
  success: boolean;
  order: IOrder;
  alreadyFulfilled: boolean;
  conflict: boolean;
  conflictNotes?: string;
}

export interface FulfillOrderOptions {
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  isCOD?: boolean;
}

/**
 * Shared, idempotent order fulfillment service.
 * Handles atomic inventory decrements, variant stock tracking,
 * simultaneous checkout conflict detection, and customer Party synchronization.
 */
export async function fulfillOrderAtomically(
  options: FulfillOrderOptions
): Promise<FulfillOrderResult> {
  await connectToDatabase();

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isCOD = false } = options;

  if (!orderId && !razorpayOrderId) {
    throw new Error('Either orderId or razorpayOrderId must be provided for order fulfillment.');
  }

  // 1. Locate the Order
  const query: any = {};
  if (orderId) query.orderId = orderId;
  else if (razorpayOrderId) query.razorpayOrderId = razorpayOrderId;

  const existingOrder = await Order.findOne(query);
  if (!existingOrder) {
    throw new Error(`Order not found matching query: ${JSON.stringify(query)}`);
  }

  // 2. Idempotency Check: if already fulfilled, return existing order cleanly
  if (existingOrder.inventoryDeducted) {
    return {
      success: true,
      order: existingOrder,
      alreadyFulfilled: true,
      conflict: !!existingOrder.inventoryConflict,
      conflictNotes: existingOrder.conflictNotes,
    };
  }

  // 3. Acquire Execution Lock Atomically
  // Only the first arriving request acquires this lock (setting status to 'Processing')
  const lockedOrder = await Order.findOneAndUpdate(
    { _id: existingOrder._id, inventoryDeducted: false },
    {
      $set: {
        paymentStatus: isCOD ? 'Pending' : 'Paid',
        status: 'Processing',
        inventoryDeducted: true,
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        ...(razorpaySignature ? { razorpaySignature } : {}),
      },
    },
    { new: true }
  );

  // If another thread already acquired the lock and flipped inventoryDeducted to true
  if (!lockedOrder) {
    const refreshed = await Order.findById(existingOrder._id);
    return {
      success: true,
      order: refreshed || existingOrder,
      alreadyFulfilled: true,
      conflict: !!refreshed?.inventoryConflict,
      conflictNotes: refreshed?.conflictNotes,
    };
  }

  // 4. Decrement Product & Variant Stock with Guarded Conditional Updates
  let hasConflict = false;
  const conflictNotesList: string[] = [];

  for (const item of lockedOrder.items) {
    const itemQty = Number(item.quantity) || 1;
    if (!item.productId) continue;

    try {
      if (item.variantName && item.variantName.trim()) {
        // Variant-level decrement: ensure variants.$.quantity >= itemQty
        const variantUpdateResult = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            'variants.name': item.variantName.trim(),
            'variants.quantity': { $gte: itemQty },
          },
          {
            $inc: {
              'variants.$.quantity': -itemQty,
              quantity: -itemQty,
            },
          },
          { new: true }
        );

        if (!variantUpdateResult) {
          hasConflict = true;
          conflictNotesList.push(
            `Insufficient stock for variant "${item.variantName}" of "${item.name}" (Requested: ${itemQty})`
          );
        }
      } else {
        // Top-level product decrement: ensure quantity >= itemQty
        const productUpdateResult = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            quantity: { $gte: itemQty },
          },
          {
            $inc: { quantity: -itemQty },
          },
          { new: true }
        );

        if (!productUpdateResult) {
          hasConflict = true;
          conflictNotesList.push(
            `Insufficient stock for product "${item.name}" (Requested: ${itemQty})`
          );
        }
      }
    } catch (stockErr: any) {
      console.error(`Error decrementing stock for item ${item.productId}:`, stockErr);
      hasConflict = true;
      conflictNotesList.push(`Error updating stock for "${item.name}": ${stockErr.message}`);
    }
  }

  // 5. If stock conflict was detected, flag the order for administrator review
  let finalOrder = lockedOrder;
  if (hasConflict) {
    finalOrder = (await Order.findByIdAndUpdate(
      lockedOrder._id,
      {
        $set: {
          inventoryConflict: true,
          conflictNotes: conflictNotesList.join('; '),
        },
      },
      { new: true }
    )) || lockedOrder;
  }

  // 6. Sync Customer into Party Directory for billing & accounting
  const customerPhone = lockedOrder.customerPhone?.trim();
  if (customerPhone && customerPhone !== '0000000000') {
    try {
      await Party.findOneAndUpdate(
        { phone: customerPhone },
        {
          $setOnInsert: { partyType: 'CUSTOMER', openingBalance: 0, currentBalance: 0 },
          $set: {
            name: lockedOrder.customerName?.trim() || 'Customer',
            phone: customerPhone,
            email: lockedOrder.customerEmail?.trim() || '',
            address: `${lockedOrder.shippingAddress || ''}${lockedOrder.pincode ? `, ${lockedOrder.pincode}` : ''}`,
          },
        },
        { upsert: true, new: true }
      );
    } catch (partyErr) {
      console.error('Failed to sync customer into Party model:', partyErr);
    }
  }

  return {
    success: true,
    order: finalOrder,
    alreadyFulfilled: false,
    conflict: hasConflict,
    conflictNotes: finalOrder.conflictNotes,
  };
}

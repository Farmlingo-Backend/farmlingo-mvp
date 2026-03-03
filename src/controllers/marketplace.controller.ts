import { Request, Response, NextFunction } from 'express';
import { eq, sql, and, or, like, desc, asc, isNull } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { 
  marketplace_listings, 
  orders, 
  marketplace_categories,
  learning_materials
} from '../db/schema-marketplace';
import { users, institutions } from '../db/schema';
import { AuthContext } from '../types/rbac-comprehensive';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

/**
 * Marketplace Controller
 * Handles marketplace operations including listings, orders, and reviews
 */
export class MarketplaceController {
  /**
   * Get all marketplace listings with filtering and pagination
   */
  async getMarketplaceListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { page = 1, limit = 20, category, institution, search, status, type } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      // Build query with joins for seller and institution names
      let query = db.select({
        listingId: marketplace_listings.listing_id,
        title: marketplace_listings.title,
        description: marketplace_listings.description,
        price: marketplace_listings.price,
        sellerId: marketplace_listings.seller_id,
        sellerName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        institutionId: marketplace_listings.institution_id,
        institutionName: institutions.name,
        category: marketplace_listings.category_id,
        type: marketplace_listings.listing_type,
        status: marketplace_listings.status,
        isDigital: marketplace_listings.is_digital,
        stockQuantity: marketplace_listings.stock_quantity,
        thumbnailUrl: marketplace_listings.thumbnail_url,
        createdAt: marketplace_listings.created_at,
        updatedAt: marketplace_listings.updated_at,
      })
      .from(marketplace_listings)
      .leftJoin(users, eq(marketplace_listings.seller_id, users.user_id))
      .leftJoin(institutions, eq(marketplace_listings.institution_id, institutions.institution_id))
      .where(eq(marketplace_listings.status, 'active'));

      // Apply filters
      if (category) {
        query = query.where(eq(marketplace_listings.category_id, category as string));
      }

      if (institution) {
        query = query.where(eq(marketplace_listings.institution_id, institution as string));
      }

      if (search) {
        query = query.where(
          or(
            like(marketplace_listings.title, `%${search}%`),
            like(marketplace_listings.description, `%${search}%`)
          )
        );
      }

      if (status) {
        // Validate that status is a valid enum value
        const validStatuses = ['draft', 'active', 'inactive', 'sold_out', 'suspended'] as const;
        if (validStatuses.includes(status as any)) {
          query = query.where(eq(marketplace_listings.status, status as any));
        }
      }

      if (type) {
        query = query.where(eq(marketplace_listings.listing_type, type as string));
      }

      // Apply institution scope for non-super admins
      if (auth.role !== 'super_admin' && auth.institutionId) {
        query = query.where(eq(marketplace_listings.institution_id, auth.institutionId));
      }

      const listings = await query
        .orderBy(desc(marketplace_listings.created_at))
        .limit(limitNum)
        .offset(offset);

      // Get total count for pagination
      // Build conditions dynamically
      const conditions = [eq(marketplace_listings.status, 'active')];
      
      if (auth.role !== 'super_admin' && auth.institutionId) {
        conditions.push(eq(marketplace_listings.institution_id, auth.institutionId));
      }

      const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(marketplace_listings)
        .where(and(...conditions));


      res.json({
        success: true,
        data: listings,
        pagination: {
          page: parseInt(page as string),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get a specific marketplace listing by ID
   */
  async getMarketplaceListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { listingId } = req.params;

      const [listing] = await db.select({
        listingId: marketplace_listings.listing_id,
        title: marketplace_listings.title,
        description: marketplace_listings.description,
        price: marketplace_listings.price,
        sellerId: marketplace_listings.seller_id,
        sellerName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        institutionId: marketplace_listings.institution_id,
        institutionName: institutions.name,
        category: marketplace_listings.category_id,
        type: marketplace_listings.listing_type,
        status: marketplace_listings.status,
        isDigital: marketplace_listings.is_digital,
        stockQuantity: marketplace_listings.stock_quantity,
        thumbnailUrl: marketplace_listings.thumbnail_url,
        downloadUrl: marketplace_listings.download_url,
        metadata: marketplace_listings.metadata,
        createdAt: marketplace_listings.created_at,
        updatedAt: marketplace_listings.updated_at,
      })
      .from(marketplace_listings)
      .leftJoin(users, eq(marketplace_listings.seller_id, users.user_id))
      .leftJoin(institutions, eq(marketplace_listings.institution_id, institutions.institution_id))
      .where(eq(marketplace_listings.listing_id, listingId))
      .limit(1);

      if (!listing) {
        return next(createHttpError(404, 'Listing not found'));
      }

      // Check institution access
      if (auth.role !== 'super_admin' && listing.institutionId !== auth.institutionId) {
        return next(createHttpError(403, 'Access denied: Cannot access listings from different institution'));
      }

      res.json({
        success: true,
        data: listing
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Create a new marketplace listing
   */
  async createMarketplaceListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { title, description, price, currency, category_id, listing_type, stock_quantity, is_digital, download_url, thumbnail_url, metadata } = req.body;

      if (!title || !price) {
        return next(createHttpError(400, 'Title and price are required'));
      }

      if (price <= 0) {
        return next(createHttpError(400, 'Price must be greater than 0'));
      }

      const [newListing] = await db.insert(marketplace_listings).values({
        title,
        description: description || null,
        price,
        currency: currency || 'USD',
        seller_id: auth.userId,
        institution_id: auth.institutionId,
        category_id: category_id || null,
        listing_type: listing_type || 'product',
        status: 'draft',
        stock_quantity: stock_quantity || 0,
        is_digital: is_digital || false,
        download_url: download_url || null,
        thumbnail_url: thumbnail_url || null,
        metadata: metadata || null,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning({
        listingId: marketplace_listings.listing_id,
        title: marketplace_listings.title,
        description: marketplace_listings.description,
        price: marketplace_listings.price,
        sellerId: marketplace_listings.seller_id,
        institutionId: marketplace_listings.institution_id,
        category: marketplace_listings.category_id,
        type: marketplace_listings.listing_type,
        status: marketplace_listings.status,
        isDigital: marketplace_listings.is_digital,
        stockQuantity: marketplace_listings.stock_quantity,
        thumbnailUrl: marketplace_listings.thumbnail_url,
        createdAt: marketplace_listings.created_at,
        updatedAt: marketplace_listings.updated_at,
      });

      res.status(201).json({
        success: true,
        data: newListing
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Update a marketplace listing
   */
  async updateMarketplaceListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { listingId } = req.params;
      const updates = req.body;

      // Check if listing exists and belongs to user or user is admin
      const [existingListing] = await db.select()
        .from(marketplace_listings)
        .where(eq(marketplace_listings.listing_id, listingId))
        .limit(1);

      if (!existingListing) {
        return next(createHttpError(404, 'Listing not found'));
      }

      // Check permissions
      if (auth.role !== 'super_admin' && auth.role !== 'institution_admin') {
        if (existingListing.seller_id !== auth.userId) {
          return next(createHttpError(403, 'Access denied: Can only update your own listings'));
        }
      }

      // Check institution scope
      if (auth.role !== 'super_admin' && existingListing.institution_id !== auth.institutionId) {
        return next(createHttpError(403, 'Access denied: Cannot update listings from different institution'));
      }

      const [updatedListing] = await db.update(marketplace_listings)
        .set({
          ...updates,
          updated_at: new Date()
        })
        .where(eq(marketplace_listings.listing_id, listingId))
        .returning({
          listingId: marketplace_listings.listing_id,
          title: marketplace_listings.title,
          description: marketplace_listings.description,
          price: marketplace_listings.price,
          sellerId: marketplace_listings.seller_id,
          institutionId: marketplace_listings.institution_id,
          category: marketplace_listings.category_id,
          type: marketplace_listings.listing_type,
          status: marketplace_listings.status,
          isDigital: marketplace_listings.is_digital,
          stockQuantity: marketplace_listings.stock_quantity,
          thumbnailUrl: marketplace_listings.thumbnail_url,
          createdAt: marketplace_listings.created_at,
          updatedAt: marketplace_listings.updated_at,
        });

      res.json({
        success: true,
        data: updatedListing
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Delete a marketplace listing
   */
  async deleteMarketplaceListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { listingId } = req.params;

      // Check if listing exists and belongs to user or user is admin
      const [existingListing] = await db.select()
        .from(marketplace_listings)
        .where(eq(marketplace_listings.listing_id, listingId))
        .limit(1);

      if (!existingListing) {
        return next(createHttpError(404, 'Listing not found'));
      }

      // Check permissions
      if (auth.role !== 'super_admin' && auth.role !== 'institution_admin') {
        if (existingListing.seller_id !== auth.userId) {
          return next(createHttpError(403, 'Access denied: Can only delete your own listings'));
        }
      }

      // Check institution scope
      if (auth.role !== 'super_admin' && existingListing.institution_id !== auth.institutionId) {
        return next(createHttpError(403, 'Access denied: Cannot delete listings from different institution'));
      }

      await db.delete(marketplace_listings)
        .where(eq(marketplace_listings.listing_id, listingId));

      res.json({
        success: true,
        message: 'Listing deleted successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get marketplace categories
   */
  async getMarketplaceCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { parent } = req.query;

      let query = db.select({
        categoryId: marketplace_categories.category_id,
        name: marketplace_categories.name,
        description: marketplace_categories.description,
        slug: marketplace_categories.slug,
        parentCategoryId: marketplace_categories.parent_category_id,
        displayOrder: marketplace_categories.display_order,
        isActive: marketplace_categories.is_active,
        createdAt: marketplace_categories.created_at,
        updatedAt: marketplace_categories.updated_at,
      }).from(marketplace_categories);

      if (parent) {
        query = query.where(eq(marketplace_categories.parent_category_id, parent as string));
      } else {
        query = query.where(isNull(marketplace_categories.parent_category_id));
      }

      const categories = await query.orderBy(asc(marketplace_categories.display_order));

      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { page = 1, limit = 20, status } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      let query = db.select({
        orderId: orders.order_id,
        buyerId: orders.buyer_id,
        listingId: orders.listing_id,
        listingTitle: marketplace_listings.title,
        quantity: orders.quantity,
        unitPrice: orders.unit_price,
        totalAmount: orders.total_amount,
        currency: orders.currency,
        paymentStatus: orders.payment_status,
        orderStatus: orders.order_status,
        shippingAddress: orders.shipping_address,
        billingAddress: orders.billing_address,
        paymentMethod: orders.payment_method,
        transactionId: orders.transaction_id,
        notes: orders.notes,
        createdAt: orders.created_at,
        updatedAt: orders.updated_at,
      })
      .from(orders)
      .leftJoin(marketplace_listings, eq(orders.listing_id, marketplace_listings.listing_id))
      .where(eq(orders.buyer_id, auth.userId));

      if (status) {
        // Validate that status is a valid enum value
        const validOrderStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'] as const;
        if (validOrderStatuses.includes(status as any)) {
          query = query.where(eq(orders.order_status, status as any));
        }
      }

      const ordersList = await query
        .orderBy(desc(orders.created_at))
        .limit(limitNum)
        .offset(offset);

      // Get total count
      const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(eq(orders.buyer_id, auth.userId));

      res.json({
        success: true,
        data: ordersList,
        pagination: {
          page: parseInt(page as string),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { listingId, quantity, shipping_address, billing_address, payment_method, notes } = req.body;

      if (!listingId || !quantity) {
        return next(createHttpError(400, 'Listing ID and quantity are required'));
      }

      if (quantity <= 0) {
        return next(createHttpError(400, 'Quantity must be greater than 0'));
      }

      // Check if listing exists and is active
      const [listing] = await db.select()
        .from(marketplace_listings)
        .where(eq(marketplace_listings.listing_id, listingId))
        .limit(1);

      if (!listing) {
        return next(createHttpError(404, 'Listing not found'));
      }

      if (listing.status !== 'active') {
        return next(createHttpError(400, 'Listing is not available for purchase'));
      }

      // Check stock if not digital
      if (!listing.is_digital && listing.stock_quantity && listing.stock_quantity < quantity) {
        return next(createHttpError(400, 'Insufficient stock available'));
      }

      const unitPrice = listing.price;
      const totalAmount = unitPrice * quantity;

      const [newOrder] = await db.insert(orders).values({
        buyer_id: auth.userId,
        listing_id: listingId,
        seller_id: listing.seller_id,
        institution_id: listing.institution_id,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        currency: listing.currency || 'USD',
        payment_status: 'pending',
        order_status: 'pending',
        shipping_address: shipping_address || null,
        billing_address: billing_address || null,
        payment_method: payment_method || null,
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning({
        orderId: orders.order_id,
        buyerId: orders.buyer_id,
        listingId: orders.listing_id,
        quantity: orders.quantity,
        unitPrice: orders.unit_price,
        totalAmount: orders.total_amount,
        currency: orders.currency,
        paymentStatus: orders.payment_status,
        orderStatus: orders.order_status,
        createdAt: orders.created_at,
        updatedAt: orders.updated_at,
      });

      res.status(201).json({
        success: true,
        data: newOrder
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get learning materials with filtering
   */
  async getLearningMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { page = 1, limit = 20, course, lesson, access_level, type, search } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      let query = db.select({
        materialId: learning_materials.material_id,
        title: learning_materials.title,
        description: learning_materials.description,
        fileUrl: learning_materials.file_url,
        fileType: learning_materials.file_type,
        fileSize: learning_materials.file_size,
        fileName: learning_materials.file_name,
        mimeType: learning_materials.mime_type,
        durationSeconds: learning_materials.duration_seconds,
        thumbnailUrl: learning_materials.thumbnail_url,
        uploadedBy: learning_materials.uploaded_by,
        uploadedByName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        courseId: learning_materials.course_id,
        lessonId: learning_materials.lesson_id,
        institutionId: learning_materials.institution_id,
        institutionName: institutions.name,
        accessLevel: learning_materials.access_level,
        status: learning_materials.status,
        metadata: learning_materials.metadata,
        createdAt: learning_materials.created_at,
        updatedAt: learning_materials.updated_at,
      })
      .from(learning_materials)
      .leftJoin(users, eq(learning_materials.uploaded_by, users.user_id))
      .leftJoin(institutions, eq(learning_materials.institution_id, institutions.institution_id))
      .where(eq(learning_materials.status, 'published'));

      // Apply filters
      if (course) {
        query = query.where(eq(learning_materials.course_id, course as string));
      }

      if (lesson) {
        query = query.where(eq(learning_materials.lesson_id, lesson as string));
      }

      if (access_level) {
        query = query.where(eq(learning_materials.access_level, access_level as any));
      }

      if (type) {
        // Validate that type is a valid enum value
        const validTypes = ['video', 'pdf', 'document', 'audio', 'image', 'interactive', 'link'] as const;
        if (validTypes.includes(type as any)) {
          query = query.where(eq(learning_materials.file_type, type as any));
        }
      }

      if (search) {
        query = query.where(
          or(
            like(learning_materials.title, `%${search}%`),
            like(learning_materials.description, `%${search}%`)
          )
        );
      }

      // Apply institution scope for non-super admins
      if (auth.role !== 'super_admin' && auth.institutionId) {
        query = query.where(eq(learning_materials.institution_id, auth.institutionId));
      }

      const materials = await query
        .orderBy(desc(learning_materials.created_at))
        .limit(limitNum)
        .offset(offset);

      // Get total count
      // Build conditions dynamically
      const conditions = [eq(learning_materials.status, 'published')];
      
      if (auth.role !== 'super_admin' && auth.institutionId) {
        conditions.push(eq(learning_materials.institution_id, auth.institutionId));
      }

      const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(learning_materials)
        .where(and(...conditions));

      res.json({
        success: true,
        data: materials,
        pagination: {
          page: parseInt(page as string),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Upload a new learning material
   */
  async uploadLearningMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { title, description, file_url, file_type, file_size, file_name, mime_type, duration_seconds, thumbnail_url, course_id, lesson_id, access_level, metadata } = req.body;

      if (!title || !file_url || !file_type) {
        return next(createHttpError(400, 'Title, file URL, and file type are required'));
      }

      const [newMaterial] = await db.insert(learning_materials).values({
        title,
        description: description || null,
        file_url,
        file_type,
        file_size: file_size || null,
        file_name: file_name || null,
        mime_type: mime_type || null,
        duration_seconds: duration_seconds || null,
        thumbnail_url: thumbnail_url || null,
        uploaded_by: auth.userId,
        course_id: course_id || null,
        lesson_id: lesson_id || null,
        institution_id: auth.institutionId,
        access_level: access_level || 'public',
        status: 'draft',
        metadata: metadata || null,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning({
        materialId: learning_materials.material_id,
        title: learning_materials.title,
        description: learning_materials.description,
        fileUrl: learning_materials.file_url,
        fileType: learning_materials.file_type,
        fileSize: learning_materials.file_size,
        fileName: learning_materials.file_name,
        mimeType: learning_materials.mime_type,
        durationSeconds: learning_materials.duration_seconds,
        thumbnailUrl: learning_materials.thumbnail_url,
        uploadedBy: learning_materials.uploaded_by,
        courseId: learning_materials.course_id,
        lessonId: learning_materials.lesson_id,
        institutionId: learning_materials.institution_id,
        accessLevel: learning_materials.access_level,
        status: learning_materials.status,
        createdAt: learning_materials.created_at,
        updatedAt: learning_materials.updated_at,
      });

      res.status(201).json({
        success: true,
        data: newMaterial
      });
    } catch (err) {
      next(err as Error);
    }
  }
}

// Export singleton instance
export const marketplaceController = new MarketplaceController();
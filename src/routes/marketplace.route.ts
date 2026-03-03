import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplace.controller';
import { requirePermission, requireOwnInstitution } from '../middlewares/rbac';
import { authenticate, requireLearner, requireInstructor, requireInstitutionAdmin } from '../middlewares/auth';
import { Module, Action } from '../types/rbac-comprehensive';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Marketplace Listings Routes
router.get('/listings', 
  requirePermission({ module: 'marketplace' as Module, action: 'list' as Action }),
  marketplaceController.getMarketplaceListings.bind(marketplaceController)
);

router.get('/listings/:listingId', 
  requirePermission({ module: 'marketplace' as Module, action: 'read' as Action }),
  marketplaceController.getMarketplaceListingById.bind(marketplaceController)
);

router.post('/listings', 
  requireInstructor, // Only instructors and above can create listings
  requirePermission({ module: 'marketplace' as Module, action: 'create' as Action }),
  marketplaceController.createMarketplaceListing.bind(marketplaceController)
);

router.put('/listings/:listingId', 
  requirePermission({ module: 'marketplace' as Module, action: 'update' as Action }),
  marketplaceController.updateMarketplaceListing.bind(marketplaceController)
);

router.delete('/listings/:listingId', 
  requirePermission({ module: 'marketplace' as Module, action: 'delete' as Action }),
  marketplaceController.deleteMarketplaceListing.bind(marketplaceController)
);

// Marketplace Categories Routes
router.get('/categories', 
  requirePermission({ module: 'marketplace' as Module, action: 'list' as Action }),
  marketplaceController.getMarketplaceCategories.bind(marketplaceController)
);

// Orders Routes
router.get('/orders', 
  requireLearner, // Only learners can view their orders
  requirePermission({ module: 'marketplace' as Module, action: 'read' as Action }),
  marketplaceController.getUserOrders.bind(marketplaceController)
);

router.post('/orders', 
  requireLearner, // Only learners can create orders
  requirePermission({ module: 'marketplace' as Module, action: 'purchase' as Action }),
  marketplaceController.createOrder.bind(marketplaceController)
);

// Learning Materials Routes
router.get('/materials', 
  requirePermission({ module: 'material' as Module, action: 'list' as Action }),
  marketplaceController.getLearningMaterials.bind(marketplaceController)
);

router.post('/materials', 
  requireInstructor, // Only instructors and above can upload materials
  requirePermission({ module: 'material' as Module, action: 'create' as Action }),
  marketplaceController.uploadLearningMaterial.bind(marketplaceController)
);

export default router;

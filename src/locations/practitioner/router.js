import getRouter from '../get-router'

export default getRouter(
  {
    collectionName: 'cmsProviderLocationsView',
    groupId: {
      npi: '$npi',
      locationKey: '$locationKey'
    }
  }
)

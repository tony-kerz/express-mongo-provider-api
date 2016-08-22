import getRouter from '../get-router'

export default getRouter(
  {
    collectionName: 'organizationLocationsView',
    groupId: {
      locationKey: '$locationKey'
    }
  }
)

//Auth token we will use to generate a meeting and connect to it
export const authToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2NWIxZDZjZS05Njc1LTRlNmEtYmNiYS1iZTk5NTI1MzIwMzYiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5OTM4MDAzNSwiZXhwIjoxNzA3MTU2MDM1fQ.FlnvDiUpbneVZVTnQUKdFl2SpAm7MT51PdeehyTIIlk'
// API call to create meeting
export const createMeeting = async ({ token }) => {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
        method: 'POST',
        headers: {
            authorization: `${authToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
    //Destructuring the roomId from the response
    const { roomId } = await res.json()
    return roomId
}

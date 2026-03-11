import { INVITE } from '@/lib/copy'
import { useFollows } from '@/hooks/useFollows'
import { InviteLinkGenerator } from '@/components/invite/InviteLinkGenerator'
import { FollowerList } from '@/components/invite/FollowerList'

export default function InvitePage() {
  const {
    inviteLinks,
    followers,
    loading,
    createInviteLink,
    acceptFollower,
    declineFollower,
    removeFollower,
  } = useFollows()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-white">{INVITE.title}</h1>

      <InviteLinkGenerator
        inviteLinks={inviteLinks}
        onGenerate={createInviteLink}
      />

      <div>
        <h2 className="mb-3 text-sm font-medium text-white/30 uppercase tracking-wider">Followers</h2>
        <FollowerList
          followers={followers}
          loading={loading}
          onAccept={acceptFollower}
          onDecline={declineFollower}
          onRemove={removeFollower}
        />
      </div>
    </div>
  )
}

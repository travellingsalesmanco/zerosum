package resolvers

import (
	"context"
	"github.com/graph-gophers/graphql-go"
	"zerosum/models"
	"zerosum/repository"
)

type GameResolver struct {
	game *models.Game
}

func (g *GameResolver) ID(ctx context.Context) *string {
	return &g.game.Id
}

func (g *GameResolver) OWNER(ctx context.Context) (userResolver *UserResolver) {

	user, err := repository.QueryUser(models.User{
		Id: g.game.UserId,
	})

	if err == nil {
		userResolver = &UserResolver{&user}
	}
	return
}

func (g *GameResolver) TOPIC(ctx context.Context) *string {
	return &g.game.Topic
}

func (g *GameResolver) STARTTIME(ctx context.Context) *graphql.Time {
	return &graphql.Time{Time: g.game.StartTime}
}

func (g *GameResolver) ENDTIME(ctx context.Context) *graphql.Time {
	return &graphql.Time{Time: g.game.EndTime}
}

func (g *GameResolver) TOTALMONEY(ctx context.Context) *int {
	//TODO: implement summer
}

func (g *GameResolver) GAMEMODE(ctx context.Context) *models.GameMode{
	return &g.game.GameMode
}

func (g *GameResolver) STAKES(ctx context.Context) *models.Stakes{
	return &g.game.Stakes
}

func (g *GameResolver) Result(ctx context.Context) *[]*OptionResultResolver {
	//TODO: count each option
	return
}

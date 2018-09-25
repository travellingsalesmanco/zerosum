package repository

import (
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"zerosum/models"
)

// Global singleton instance
var db *gorm.DB

/* DATABASE CONFIG*/
func InitTestDB() (err error) {
	db, err = gorm.Open("postgres", fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%d sslmode=disable",
		"postgres", "password", "zerosum", "localhost", 5432))

	// Set up database tables
	db.AutoMigrate(&models.Game{}, &models.Vote{}, &models.Option{}, &models.User{})

	// Add foreign key constraints
	db.Model(models.Game{}).AddForeignKey("user_id", "users(id)", "CASCADE", "RESTRICT")
	db.Model(models.Option{}).AddForeignKey("game_id", "games(id)", "CASCADE", "RESTRICT")
	db.Model(models.Vote{}).AddForeignKey("game_id", "games(id)", "CASCADE", "RESTRICT")
	db.Model(models.Vote{}).AddForeignKey("option_id", "options(id)", "CASCADE", "RESTRICT")
	db.Model(models.Vote{}).AddForeignKey("user_id", "users(id)", "CASCADE", "RESTRICT")
	return
}

func CloseTestDB() {
	db.Close()
}

/* POLL CRUD */
func CreateGame(game models.Game) (err error) {
	// Check if alr exists
	if !db.NewRecord(game) {
		err = errors.New("game exists")
		return
	}

	res := db.Create(&game)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func QueryGame(desiredGame models.Game) (game models.Game, err error) {
	res := db.Where(desiredGame).First(&game)
	if res.RecordNotFound() {
		err = errors.New("no game found")
	} else if res.Error != nil {
		err = res.Error
	}

	return
}

func SearchGames(searchString string, limit *int32, after *int32) (games []models.Game, err error) {

	offset := int32(0)

	if after != nil {
		offset = *after
	}

	interm := db.Offset(offset)
	if limit != nil {
		interm = interm.Limit(*limit)
	}

	res := interm.Where("topic LIKE ?", fmt.Sprintf("%%%s%%", searchString)).Find(&games)
	if res.Error != nil {
		err = res.Error
	}
	return
}

func UpdateGame(game models.Game) (err error) {
	// Check if exists
	if db.NewRecord(game) {
		err = errors.New("game does not exist")
		return
	}
	res:= db.Model(&models.Game{}).Updates(game)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func DeleteGame(game models.Game) (err error) {
	// Check if exists
	if db.NewRecord(game) {
		err = errors.New("game does not exist")
		return
	}
	res:= db.Delete(&game)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func QueryGameOptions(desiredGame models.Game) (options []models.Option, err error) {
	err = db.Model(&desiredGame).Association("Options").Find(&options).Error
	return
}

func QueryOption(desiredOption models.Option) (option models.Option, err error) {
	res := db.Where(desiredOption).First(&option)
	if res.RecordNotFound() {
		err = errors.New("no option found")
	} else if res.Error != nil {
		err = res.Error
	}

	return
}

func UpdateOption(option models.Option) (err error) {
	// Check if exists
	if db.NewRecord(option) {
		err = errors.New("option does not exist")
		return
	}
	res:= db.Model(&models.Option{}).Updates(option)
	if res.Error != nil {
		err = res.Error
	}

	return
}

/* USER CRUD */
func GetOrCreateUser(desiredUser models.User) (user models.User, err error) {
	// Check if alr exists
	err = db.Where("fb_id = ?", desiredUser.FbId).Attrs(models.User{
		FbId: desiredUser.FbId,
		MoneyTotal: int32(100),
		WinRate: 0,
		GamesPlayed: 0,
		GamesWon: 0,
		Experience: 0,
		Name: "HatMatter",
		}).FirstOrCreate(&user).Error
	return
}

func QueryUser(desiredUser models.User) (user models.User, err error) {
	res := db.Where(desiredUser).First(&user)
	if res.RecordNotFound() {
		err = errors.New("no user found")
	} else if res.Error != nil {
		err = res.Error
	}

	return
}

func QueryTopUsers(limit int, minGames int) (users []models.User, err error) {
	err = db.Where("games_played > ?", minGames).Order("win_rate desc").Limit(limit).Find(&users).Error
	return
}

func UpdateUser(user models.User) (err error) {
	// Check if exists
	if db.NewRecord(user) {
		err = errors.New("user does not exist")
		return
	}
	res:= db.Model(&models.User{}).Updates(user)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func DeleteUser(user models.User) (err error) {
	// Check if exists
	if db.NewRecord(user) {
		err = errors.New("user does not exist")
		return
	}
	res:= db.Delete(&user)
	if res.Error != nil {
		err = res.Error
	}

	return
}

/* VOTE CRUD */
func CreateVote(vote models.Vote) (err error) {
	// Check if alr exists
	if !db.NewRecord(vote) {
		err = errors.New("vote exists")
		return
	}
	res := db.Create(&vote)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func QueryVote(desiredVote models.Vote) (vote models.Vote, err error) {
	res := db.Where(desiredVote).First(&vote)
	if res.RecordNotFound() {
		err = errors.New("no vote found")
	} else if res.Error != nil {
		err = res.Error
	}

	return
}

func QueryVotes(desiredVote models.Vote, limit *int32, after *int32) (votes []models.Vote, err error) {

	offset := *after
	if after == nil {
		offset = 0
	}

	interm := db.Offset(offset)
	if limit != nil {
		interm = interm.Limit(limit)
	}

	res := interm.Where(desiredVote).Find(&votes)
	if res.Error != nil {
		err = res.Error
	}
	return
}

func QueryAllGameVotes(desiredGame models.Game) (votes []models.Vote, err error) {
	err = db.Where("game_id = ?", desiredGame.Id).Find(&votes).Error
	return
}

func QueryOptionVotes(desiredOption models.Option) (votes []models.Vote, err error) {
	err = db.Where("option_id = ?", desiredOption.Id).Find(&votes).Error
	return
}

func UpdateVote(vote models.Vote) (err error) {
	// Check if exists
	if db.NewRecord(vote) {
		err = errors.New("vote does not exist")
		return
	}
	res:= db.Model(&models.Vote{}).Updates(vote)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func DeleteVote(vote models.Vote) (err error) {
	// Check if exists
	if db.NewRecord(vote) {
		err = errors.New("vote does not exist")
		return
	}
	res:= db.Delete(&vote)
	if res.Error != nil {
		err = res.Error
	}

	return
}

func CheckVoted(userId string, gameId string) bool {
	var vote models.Vote
	return db.Where("user_id = ? AND game_id = ?", userId, gameId).First(&vote).RecordNotFound()
}
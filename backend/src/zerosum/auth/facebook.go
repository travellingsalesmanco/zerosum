package auth

import (
	"encoding/json"
	"fmt"
	"github.com/graph-gophers/graphql-go/errors"
	"log"
	"net/http"
	"time"
	"zerosum/logic"
	"zerosum/models"
	"zerosum/repository"
)

type fbProfile struct {
	Name string                 `json:"name"`
	Id   string                 `json:"id"`
	Err  map[string]interface{} `json:"error"`
}
type fbResponse struct {
	Data map[string]interface{} `json:"data"`
	Err  map[string]interface{} `json:"error"`
}

type fbLoginRequest struct {
	AccessToken string `json:"accessToken"`
	UserID      string `json:"userID"`
}

type loginResponse struct {
	Token   string `json:"token"`
	NewUser bool   `json:"newUser"`
}
type msi map[string]interface{}

func FbLoginHandler(w http.ResponseWriter, r *http.Request) {
	var loginRequest fbLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginRequest); err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	if err := verifyFbToken(loginRequest); err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	profile, err := getFbProfile(loginRequest.AccessToken)
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}

	user, err := repository.GetOrCreateUser(models.User{FbId: profile.Id})
	logic.FormHatRelations(user.Id)

	signedToken, err := generateSignedUserToken(user)
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	isNewUser := time.Now().Sub(user.CreatedAt).Seconds() < 5
	res, err := json.Marshal(loginResponse{
		Token:   signedToken,
		NewUser: isNewUser,
	})
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), 500)
		return
	}
	if isNewUser {
		user.Name = profile.Name
		user.Picture, err = GetFbPicture(profile.Id)
		if err != nil {
			log.Print(err)
		}
		repository.UpdateUser(user)
	}
	w.Write(res)
}

func getFbProfile(token string) (fbProfile, error) {
	var profile fbProfile
	res, err := settings.httpClient.Get(fmt.Sprintf("https://graph.facebook.com/me?access_token=%s", token))
	if err != nil {
		return profile, err
	}
	if err = json.NewDecoder(res.Body).Decode(&profile); err != nil {
		return profile, err
	}
	//fmt.Println(profile)
	if profile.Err != nil {
		err = errors.Errorf(profile.Err["message"].(string))
	}
	return profile, err
}

func GetFbPicture(userId string) (string, error) {
	var fbRes fbResponse
	res, err := settings.httpClient.Get(fmt.Sprintf("https://graph.facebook.com/%s/picture?type=large&redirect=false", userId))
	if err != nil {
		return "", err
	}
	if err = json.NewDecoder(res.Body).Decode(&fbRes); err != nil {
		return "", err
	}
	if fbRes.Err != nil {
		return "", fmt.Errorf(fbRes.Err["message"].(string))
	}
	return fbRes.Data["url"].(string), nil
}

func verifyFbToken(loginRequest fbLoginRequest) (error) {
	// Fb token verification API
	res, err := settings.httpClient.Get(fmt.Sprintf("https://graph.facebook.com/debug_token?input_token=%s&access_token=%s",
		loginRequest.AccessToken, settings.fbAccessToken))
	if err != nil {
		return err
	}
	var body fbResponse
	if err = json.NewDecoder(res.Body).Decode(&body); err != nil {
		return err
	}
	//fmt.Printf("%+v\n", body)
	if body.Err != nil {
		err = errors.Errorf(body.Err["message"].(string))
		return err
	}
	if !body.Data["is_valid"].(bool) {
		err = errors.Errorf("Invalid token")
		return err
	}
	if body.Data["app_id"].(string) != settings.fbAppId {
		err = errors.Errorf("App ID mismatch")
		return err
	}
	if body.Data["user_id"].(string) != loginRequest.UserID {
		err = errors.Errorf("User ID mismatch")
	}
	return nil
}
